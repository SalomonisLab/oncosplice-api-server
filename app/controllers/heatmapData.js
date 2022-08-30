const exec = require('child_process').exec;
const { dbCredentials } = require("../config/oncodb.config.js");
const { setUpHeatmapQuery } = require("./databasequeryhelper.js");
var fs = require('fs');
var readline = require('readline');

async function heatmapData(req, res, next){
	if (req.method == 'POST') {
		try{
			var outputObject = {};
			var oncoSpliceClusterPath = req.body.data.cancerName.concat("/MergedResult.txt");
			var heatmapQueries = setUpHeatmapQuery(req.body.data);

			//Oncosplice Clustering map signature to oncosplice cluster
			var rpsiDict = {};
			var rpsiIndex = "NA";
			var rpsiCount = 0;
    		var oncoSpliceClusterContents = fs.readFileSync("./MergedResult.txt", 'utf-8');
    		oncoSpliceClusterContents.split(/\r?\n/).forEach(line =>  {
    			if(rpsiCount == 0)
    			{
    				var rpsiHeader = line;
    				rpsiHeader = rpsiHeader.split("\t");
    				rpsiHeader.forEach(i =>	{
						currentRH = rpsiHeader[i];
						if(currentRH == heatmapQueries.oncospliceClusterQuery.key)
						{
							rpsiIndex = i;
							//break;
						}
    				})
    				if(rpsiIndex == "NA"){
    					var newKey = heatmapQueries.oncospliceClusterQuery.key.replace("_", " ");
	    				rpsiHeader.forEach(i =>	{
							currentRH = rpsiHeader[i];
							if(currentRH == newKey)
							{
								rpsiIndex = i;
								//break;
							}
	    				})    					
    				} 
    				rpsiCount += 1;			
    			}
    			else
    			{
					if(rpsiIndex != "NA")
					{
						var rpsiLine = line.split("\t");
						var rowLabel = rpsiLine[0];
						rowLabel = rowLabel.replace(".", "_");
						rowLabel = rowLabel.replace("-", "_");
						rowLabel = rowLabel.toLowerCase();
						rpsiDict[rowLabel] = rpsiLine[rpsiIndex];
					}
    			}
			})

			if(heatmapQueries.signatureQuery != undefined)
			{
				var UIDsubMakeQuery = " WHERE (";
				var pgArr = [];
				var count = 0;

				var signatureDataResult = await dbCredentials.query(heatmapQueries.signatureQuery);
				signatureDataResult.rows.forEach(row => {
					pgArr[count] = row["uid"];
					count += 1;
				})

				for(var i = 0; i < count; i++)
				{
					//$pizza  = "piece1 piece2 piece3 piece4 piece5 piece6";
					//$pieces = explode("|", $pgarr[$i]);
					if(i != (count - 1))
					{
						UIDsubMakeQuery = UIDsubMakeQuery.concat("pancanceruid = ").concat("'").concat(pgArr[i]).concat("' OR ");
					}
					else
					{
						UIDsubMakeQuery = UIDsubMakeQuery.concat("pancanceruid = ").concat("'").concat(pgArr[i]).concat("')");
					}
				}
				outputObject["exm1"] = UIDsubMakeQuery;
			}
			//Set up metaresult
			var mArr = [];
			var mArrCount = 0;

			//First query for sample ids. Will need to be changed to be contructed in depth.
			if(heatmapQueries.metadataQuery != undefined)
			{
				var metaDataResult = await dbCredentials.query(heatmapQueries.metadataQuery);
				metaDataResult.rows.forEach(row => {
				  mArr[mArrCount] = row["uid"];
				  mArrCount += 1;
				})
			}

			var makeQuery = "SELECT symbol, description, examined_Junction, background_major_junction, altexons, proteinpredictions, dpsi, clusterid, uid, coordinates, eventannotation, ";
			if(mArr.length > 0)
			{
				for(let i = 0; i < mArr.length; i++)
				{
					//Strings have to be edited in order to be matched
					var strEdit = mArr[i].replace(/\.|\-/g, "_");
					strEdit = strEdit.toLowerCase();

					//Add to query string
					if(strEdit != 'na' && strEdit != '')
					{
						makeQuery = makeQuery.concat(strEdit);
					}
					if(i != mArr.length - 1)
					{
						if(strEdit != 'na' && strEdit != '')
						{
							makeQuery = makeQuery.concat(", ");
						}
					}
					else
					{
						if(heatmapQueries.metadataQuery == undefined)
						{
							makeQuery = "SELECT * FROM ".concat(heatmapQueries.cancerTableName).concat("_SPLICE ");
						}
						else
						{	
							let secondToLast = makeQuery.slice(-1);
							if(secondToLast == " ")
							{
								makeQuery.slice(0, -2);
							}
							makeQuery = makeQuery.concat(" FROM ").concat(heatmapQueries.cancerTableName).concat("_SPLICE ");
						}
						if(UIDsubMakeQuery != undefined)//Check for normal signature filter
						{
							makeQuery = makeQuery.concat(UIDsubMakeQuery);
						}
						else if(heatmapQueries.geneQuery != undefined)//Check for 
						{
							makeQuery = makeQuery.concat(heatmapQueries.geneQuery);
						}
						else if(heatmapQueries.coordQuery != undefined)//
						{
							makeQuery = makeQuery.concat(heatmapQueries.coordQuery);
						}
					}
				}
			}
			else
			{
				if(heatmapQueries.metadataQuery == undefined)
				{
					makeQuery = "SELECT * FROM ".concat(heatmapQueries.cancerTableName).concat("_SPLICE ");
				}
				else
				{	
					let secondToLast = makeQuery.slice(-1);
					if(secondToLast == " ")
					{
						makeQuery.slice(0, -2);
					}
					makeQuery = makeQuery.concat(" FROM ").concat(heatmapQueries.cancerTableName).concat("_SPLICE ");
				}
				if(UIDsubMakeQuery != undefined)//Check for normal signature filter
				{
					makeQuery = makeQuery.concat(UIDsubMakeQuery);
				}
				else if(heatmapQueries.geneQuery != undefined)//Check for 
				{
					makeQuery = makeQuery.concat(heatmapQueries.geneQuery);
				}
				else if(heatmapQueries.coordQuery != undefined)//
				{
					makeQuery = makeQuery.concat(heatmapQueries.coordQuery);
				}
			}

			//Remove newline characters (if any) from result
			makeQuery = makeQuery.replace(/\n|\r/g, "");

			var result = await dbCredentials.query(makeQuery);
			//outputObject["exm2"] = makeQuery;
			//Set up result
			var rr = "";
			//let enum = 50;
			var returned_result = {};
			var col_beds = [];
			var col_beds_i = 0;

			//This line takes the number of columns
			var total_cols = result.fields.length;
			var resultboxfile = fs.createWriteStream("resultboxfile.txt");
			
			resultboxfile.write("uid\t")
			for(let i = 0; i < total_cols; i++)
			{
				let cur_name = result.fields[i].name;
				let first_4_chars = cur_name.slice(0, 4);
				let last_4_chars = cur_name.slice(0, -4);
				if(first_4_chars == "tcga")
				{
					col_beds[col_beds_i] = cur_name;
					col_beds_i = col_beds_i + 1;
				}
				else if(last_4_chars == "_bed")
				{
					col_beds[col_beds_i] = cur_name;
					col_beds_i = col_beds_i + 1;
				}
			}

			for(let i = 0; i < col_beds.length; i++)
			{
				resultboxfile.write(col_beds[i]);
				if(i != (col_beds.length - 1))
				{
					resultboxfile.write("\t");
				}
			}
			resultboxfile.write("\n");

			//Get data
			var ic = 0;
			console.log(result.rows.length);
			result.rows.forEach(row => {
			  returned_result[row["uid"]] = row;
			  resultboxfile.write(row["uid"]);
			  resultboxfile.write("\t");
			  for(let k = 0; k < col_beds.length; k++)
			  {
				resultboxfile.write(row[col_beds[k]]);
				if(k != (col_beds.length - 1))
				{
					resultboxfile.write("\t");
				}
			  }
			  resultboxfile.write("\n");

			  ic = ic + 1;
			})

			function os_func() {
			    this.execCommand = function(cmd, callback) {
			        exec(cmd, (error, stdout, stderr) => {
			            if (error) {
			                console.error(`exec error: ${error}`);
			                return;
			            }

			            callback(stdout);
			        });
			    }
			}

			var columnNamesInitial;
			var columnClusterIndex;
			var columnClusterReturned;
			var columnNamesFirstReturned;
			var output = {};
			var i = 0;
			var indexList = [];
			var outarr = [];

			var os = new os_func();
			var clusterCommand = "python HC_only_circa_v1.py --i resultboxfile.txt --row_method ward --column_method ward --row_metric cosine --column_metric cosine --normalize True 2>&1 &";
			os.execCommand(clusterCommand, function (returnvalue) {
				//console.log("funkypants", returnvalue);
				var read_stream = fs.createReadStream("resultboxfile-clustered.txt");
				var rl = readline.createInterface({
				    input: read_stream
				});
				var fileLineCount = 0;
				var vertexes_number;
				var edges_number;
				var edges = [];
				rl.on('line', function(line){
					if(fileLineCount == 0)
					{
						line = line.replace("\n", "");
						columnNamesInitial = line.split("\t");
						columnNamesInitial = columnNamesInitial.slice(1);
					}
					else if(fileLineCount == 1)
					{
						line = line.replace("\n", "");
						columnClusterIndex = line.split("\t");
						columnClusterIndex = columnClusterIndex.slice(1);
					}
					else
					{
						line = line.split("\t");
						if(line.length > 1)
						{
							outarr[i] = {};
							returned_result[line[0]] = {};
							outarr[i]["uid"] = line[0];
							outarr[i]["pancanceruid"] = line[0];
							outarr[i]["symbol"] = returned_result[line[0]]["symbol"];
							outarr[i]["description"] = returned_result[line[0]]["description"];
							outarr[i]["examined_junction"] = returned_result[line[0]]["examined_junction"];
							outarr[i]["background_major_junction"] = returned_result[line[0]]["background_major_junction"];
							outarr[i]["altexons"] = returned_result[line[0]]["altexons"];
							outarr[i]["proteinpredictions"] = returned_result[line[0]]["proteinpredictions"];
							outarr[i]["dpsi"] = returned_result[line[0]]["dpsi"];
							outarr[i]["clusterid"] = returned_result[line[0]]["clusterid"];
							outarr[i]["chromosome"] = returned_result[line[0]]["chromosome"];
							outarr[i]["coord1"] = returned_result[line[0]]["coord1"];
							outarr[i]["coord2"] = returned_result[line[0]]["coord2"];
							outarr[i]["coord3"] = returned_result[line[0]]["coord3"];
							outarr[i]["coord4"] = returned_result[line[0]]["coord4"];
							outarr[i]["eventannotation"] = returned_result[line[0]]["eventannotation"];
							for(let k = 0; k < columnNamesInitial.length; k++)
							{
								outarr[i][columnNamesInitial[k]] = line[k+1];
							}
						}
						indexList[i] = line;
						i = i + 1;
					}
				    fileLineCount = fileLineCount + 1;
				    //console.log("EXCELLENTPANTS", fileLineCount);
				});

				rl.on('close', function(){
					//console.log("SUPERPANTS");
				    rl.close();
					outputObject["data"] = outarr;
					res.send(outputObject);
				});
			});

		}
		catch(error){
			res.send(error);
			return next(error);
		}
	}
}

module.exports.heatmapData = heatmapData;