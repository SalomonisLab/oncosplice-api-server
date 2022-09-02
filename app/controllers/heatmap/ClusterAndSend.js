const exec = require('child_process').exec;
const { dbCredentials } = require("../../config/oncodb.config.js");
var fs = require('fs');
var uuid = require('uuid');
var readline = require('readline');

async function clusterDataAndSend(res, queryResult, generatedUUID, outputObject){
	
	//Set up result
	var returnedResult = {};
	var colBeds = [];
	var colBedsIndex = 0;

	//This line takes the number of columns
	var totalColsLength = queryResult.fields.length;
	var resultBoxFileName = generatedUUID;
	var resultBoxFile = fs.createWriteStream((resultBoxFileName.concat(".txt")));
			
	resultBoxFile.write("uid\t")
	for(let i = 0; i < totalColsLength; i++)
	{
		let curName = queryResult.fields[i].name;
		let first4Chars = curName.slice(0, 4);
		let last4Chars = curName.slice(0, -4);
		if(first4Chars == "tcga")
		{
			colBeds[colBedsIndex] = curName;
			colBedsIndex = colBedsIndex + 1;
		}
		else if(last4Chars == "_bed")
		{
			colBeds[colBedsIndex] = curName;
			colBedsIndex = colBedsIndex + 1;
		}
	}

	for(let i = 0; i < colBeds.length; i++)
	{
		resultBoxFile.write(colBeds[i]);
		if(i != (colBeds.length - 1))
		{
			resultBoxFile.write("\t");
		}
	}
	resultBoxFile.write("\n");

	//Get data
	queryResult.rows.forEach(row => {
		returnedResult[row["uid"]] = row;
		resultBoxFile.write(row["uid"]);
		resultBoxFile.write("\t");
		for(let k = 0; k < colBeds.length; k++)
		{
			resultBoxFile.write(row[colBeds[k]]);
			if(k != (colBeds.length - 1))
			{
				resultBoxFile.write("\t");
			}
		}
		resultBoxFile.write("\n");
	})

	//This function codes the command line execution
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
	var i = 0;
	var indexList = [];
	var clusteredHeatmapArray = [];

	var os = new os_func();
	var clusterCommand = "python HC_only_circa_v1.py --i ".concat(resultBoxFileName.concat(".txt")).concat(" --row_method ward --column_method ward --row_metric cosine --column_metric cosine --normalize True 2>&1 &");
	os.execCommand(clusterCommand, function (returnvalue) {
		//console.log("funkypants", returnvalue);
		var readStream = fs.createReadStream((resultBoxFileName.concat("-clustered.txt")));
		var rl = readline.createInterface({
			input: readStream
		});
		var fileLineCount = 0;
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
					clusteredHeatmapArray[i] = {};
					returnedResult[line[0]] = {};
					clusteredHeatmapArray[i]["uid"] = line[0];
					clusteredHeatmapArray[i]["pancanceruid"] = line[0];
					clusteredHeatmapArray[i]["symbol"] = returnedResult[line[0]]["symbol"];
					clusteredHeatmapArray[i]["description"] = returnedResult[line[0]]["description"];
					clusteredHeatmapArray[i]["examined_junction"] = returnedResult[line[0]]["examined_junction"];
					clusteredHeatmapArray[i]["background_major_junction"] = returnedResult[line[0]]["background_major_junction"];
					clusteredHeatmapArray[i]["altexons"] = returnedResult[line[0]]["altexons"];
					clusteredHeatmapArray[i]["proteinpredictions"] = returnedResult[line[0]]["proteinpredictions"];
					clusteredHeatmapArray[i]["dpsi"] = returnedResult[line[0]]["dpsi"];
					clusteredHeatmapArray[i]["clusterid"] = returnedResult[line[0]]["clusterid"];
					clusteredHeatmapArray[i]["chromosome"] = returnedResult[line[0]]["chromosome"];
					clusteredHeatmapArray[i]["coord1"] = returnedResult[line[0]]["coord1"];
					clusteredHeatmapArray[i]["coord2"] = returnedResult[line[0]]["coord2"];
					clusteredHeatmapArray[i]["coord3"] = returnedResult[line[0]]["coord3"];
					clusteredHeatmapArray[i]["coord4"] = returnedResult[line[0]]["coord4"];
					clusteredHeatmapArray[i]["eventannotation"] = returnedResult[line[0]]["eventannotation"];
					for(let k = 0; k < columnNamesInitial.length; k++)
					{
						clusteredHeatmapArray[i][columnNamesInitial[k]] = line[k+1];
					}
				}
				indexList[i] = line;
				i = i + 1;
			}
			fileLineCount = fileLineCount + 1;
		});
		rl.on('close', function(){
			rl.close();
			outputObject["rr"] = clusteredHeatmapArray;
			outputObject["cci"] = columnClusterIndex;
			outputObject["col_beds"] = columnNamesInitial;
			const pathToUnclusteredFile = resultBoxFileName.concat(".txt");
			const pathToClusteredFile = resultBoxFileName.concat("-clustered.txt");

			fs.unlink(pathToUnclusteredFile, function(err) {
				if (err) {
					throw err
				} else {
					console.log("Successfully deleted unclustered file.")
				}
			})		

			fs.unlink(pathToClusteredFile, function(err) {
				if (err) {
					throw err
				} else {
					console.log("Successfully deleted clustered file.")
				}
			})
			res.send(outputObject);
		});
	});
}

module.exports.clusterDataAndSend = clusterDataAndSend;