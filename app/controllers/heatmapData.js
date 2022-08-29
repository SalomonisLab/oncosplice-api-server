const fs = require('fs');
const exec = require('child_process').exec;
const { dbCredentials } = require("../config/oncodb.config.js");
const { setUpHeatmapQuery } = require("./databasequeryhelper.js");

async function heatmapData(req, res, next){
	if (req.method == 'POST') {
		try{
			var outputObject = {};
			var oncoSpliceClusterPath = req.body.data.cancerType.concat("/MergedResult.txt");
			let heatmapQueries = setUpHeatmapQuery(req.body.data);

			//Oncosplice Clustering map signature to oncosplice cluster
			let rpsiDict = {};
			let rpsiIndex = "NA";
			let rpsiCount = 0;
    		let oncoSpliceClusterContents = fs.readFileSync(oncoSpliceClusterPath, 'utf-8');
    		oncoSpliceClusterContents.split(/\r?\n/).forEach(line =>  {
    			if(rpsiCount == 0)
    			{
    				let rpsiHeader = line;
    				rpsiHeader = rpsiHeader.split("\t");
    				rpsiHeader.forEach(i =>	{
						currentRH = rpsiHeader[i];
						if(currentRH == heatmapQueries.oncospliceClusterQuery.key)
						{
							rpsiIndex = i;
							break;
						}
    				})
    				if(rpsiIndex == "NA"){
    					let newKey = heatmapQueries.oncospliceClusterQuery.key.replace("_", " ");
	    				rpsiHeader.forEach(i =>	{
							currentRH = rpsiHeader[i];
							if(currentRH == newKey)
							{
								rpsiIndex = i;
								break;
							}
	    				})    					
    				} 
    				rpsiCount += 1;			
    			}
    			else
    			{
					if(rpsiIndex != "NA")
					{
						let rpsiLine = explode("\t", line);
						let rowLabel = rpsiLine[0];
						rowLabel = str_replace(".", "_", rowLabel);
						rowLabel = str_replace("-", "_", rowLabel);
						rowLabel = strtolower(rowLabel);
						rpsiDict[rowLabel] = rpsiLine[rpsiIndex];
					}
    			}
			})

			if(heatmapQueries.signatureQuery != undefined)
			{
				let UIDsubMakeQuery = " WHERE (";
				let pgArr = [];
				let count = 0;

				let signatureDataResult = await dbCredentials.query(heatmapQueries.signatureQuery);
				signatureDataResult.rows.forEach(row => {
					pgArr[count] = row["uid"];
					count += 1;
				})

				for(i = 0; i < count; i++)
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
			}

			//Set up metaresult
			let mArr = [];
			let mArrCount = 0;

			//First query for sample ids. Will need to be changed to be contructed in depth.
			if(heatmapQueries.metadataQuery != undefined)
			{
				let metaDataResult = await dbCredentials.query(heatmapQueries.metadataQuery);
				metaDataResult.rows.forEach(row => {
				  mArr[mArrCount] = row["uid"];
				  mArrCount += 1;
				})
			}

			let makeQuery = "SELECT symbol, description, examined_Junction, background_major_junction, altexons, proteinpredictions, dpsi, clusterid, uid, coordinates, eventannotation, ";
			if(mArr.length > 0)
			{
				for(let i = 0; i < mArr.length; i++)
				{
					//Strings have to be edited in order to be matched
					let strEdit = mArr[i].replace(/\.|\-/g, "_");
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

			let result = await dbCredentials.query(makeQuery);

			//Set up result
			let rr = "";
			let enum = 50;
			let returned_result = {};
			let col_beds = [];
			let col_beds_i = 0;

			//This line takes the number of columns
			let total_cols = result.fields.length;
			let resultboxfile = fs.createWriteStream("resultboxfile.txt");
			
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

			let ic = 0;
			//Get data
			result.rows.forEach(row => {
			  if(ic > 5000)
			  {
			  	break;
			  }
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
			var indexList = {};
			var outarr = {};

			async function processLineByLine(in_file) {
			  var lineCount = 0
			  try {
			    const rl = readline.createInterface({
			      input: fs.createReadStream(in_file),
			      crlfDelay: Infinity
			    });

			    rl.on('line', (line) => {
			    	if(lineCount == 0){
						line = str_replace("\n","",line);
						column_names_initial = explode("\t", line);

			    	}
			    	else if(lineCount == 1){

			    	}
			    	else{

			    	}
			    	lineCount += 1;
			    });

			    await events.once(rl, 'close');

			  } catch (err) {
			    console.error(err);
			  }
			}

			var os = new os_func();
			let clusterCommand = "python HC_only_circa_v1.py --i resultboxfile.txt --row_method ward --column_method ward --row_metric cosine --column_metric cosine --normalize True 2>&1 &";
			os.execCommand(clusterCommand, function (returnvalue) {
			    processLineByLine("resultboxfile-clustered.txt")

			});
			$line = fgets($file);
			$line = str_replace("\n","",$line);
			$column_names_initial = explode("\t", $line);

			$line = fgets($file);
			$line = str_replace("\n","",$line);
			$column_cluster_index = explode("\t", $line);
			$column_cluster_returned = array_shift($column_cluster_index);

			$column_names_first_returned = array_shift($column_names_initial);
			$output = array();
			$index_list = array();
			$outarr = array();
			$i = 0;

		}
		catch(error){
			res.send(error);
			return next(error);
		}
	}
}

module.exports.heatmapData = heatmapData;