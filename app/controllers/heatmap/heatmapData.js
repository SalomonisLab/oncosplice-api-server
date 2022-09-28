const exec = require('child_process').exec;
const { dbCredentials } = require("../../config/oncodb.config.js");
const { setUpHeatmapQuery } = require("../databasequeryhelper.js");
const { clusterDataAndSend } = require("./clusterAndSend.js");
var fs = require('fs');
var uuid = require('uuid');
var readline = require('readline');

//Separate into smaller functions. Maybe make a separate folder

async function heatmapData(req, res, next){
	if (req.method == 'POST') {
		try{
			var outputObject = {};
			//Change this to fileless database format.
			var oncoSpliceClusterPath = "oncoclusters/".concat(req.body.data.cancerName).concat("_MergedResult.txt");
			var heatmapQueries = setUpHeatmapQuery(req.body.data);

			//Oncosplice Clustering map signature to oncosplice cluster
			//use "let" when needed
			var oncospliceClustersDict = {};
			var oncospliceClustersIndex = "NA";
			var oncospliceClustersFileIterator = 0;
			if(heatmapQueries.oncospliceClusterQuery.key != undefined)
			{
	    		var oncoSpliceClusterContents = fs.readFileSync(oncoSpliceClusterPath, 'utf-8');
	    		oncoSpliceClusterContents.split(/\r?\n/).forEach(line =>  {
	    			if(oncospliceClustersFileIterator == 0)
	    			{
	    				var oncospliceClustersFileHeader = line;
	    				oncospliceClustersFileHeader = oncospliceClustersFileHeader.split("\t");
	    				for(let i = 0; i < oncospliceClustersFileHeader.length; i++)
	    				{
							if(oncospliceClustersFileHeader[i] == heatmapQueries.oncospliceClusterQuery.key)
							{
								oncospliceClustersIndex = i;
								break;
							}
	    				}
	    				if(oncospliceClustersIndex == "NA"){
	    					var newKey = heatmapQueries.oncospliceClusterQuery.key.replace("_", " ");
		    				for(let i = 0; i < oncospliceClustersFileHeader.length; i++)
		    				{
								if(oncospliceClustersFileHeader[i] == newKey)
								{
									oncospliceClustersIndex = i;
									break;
								}
		    				}
	    				}
	    				oncospliceClustersFileIterator += 1;			
	    			}
	    			else
	    			{
						if(oncospliceClustersIndex != "NA")
						{
							let oncospliceClustersFileLine = line.split("\t");
							let rowLabel = oncospliceClustersFileLine[0].replace(/\.|\-/g, "_").toLowerCase();
							oncospliceClustersDict[rowLabel] = oncospliceClustersFileLine[oncospliceClustersIndex];
						}
	    			}
				})
    		}

    		//Remove redundant call for signatures
    		//We already have UIDs! We don't need to fetch them again.
			if(heatmapQueries.signatureQuery != undefined)
			{
				var signatureUIDSforHeatmapQuery = " WHERE (";
				var returnedArrayOfUIDs = [];
				var count = 0;

				var signatureDataResult = await dbCredentials.query(heatmapQueries.signatureQuery);
				signatureDataResult.rows.forEach(row => {
					returnedArrayOfUIDs[count] = row["uid"];
					count += 1;
				})

				for(let i = 0; i < count; i++)
				{
					if(i != (count - 1))
					{
						signatureUIDSforHeatmapQuery = signatureUIDSforHeatmapQuery.concat("pancanceruid = ").concat("'").concat(returnedArrayOfUIDs[i]).concat("' OR ");
					}
					else
					{
						signatureUIDSforHeatmapQuery = signatureUIDSforHeatmapQuery.concat("pancanceruid = ").concat("'").concat(returnedArrayOfUIDs[i]).concat("')");
					}
				}
			}
			//Set up metaresult
			var sampleResultArr = [];

			//First query for sample ids. Will need to be changed to be contructed in depth.
			//Change to sample data. NOT samples.
			if(heatmapQueries.samplesQuery != undefined)
			{
				var samplesResult = await dbCredentials.query(heatmapQueries.samplesQuery);
				samplesResult.rows.forEach(row => {
				  sampleResultArr[sampleResultArr.length] = row["uid"];
				})
			}

			//makeQuery is a dumb name, call it "splicing data query" or something like that.
			var getHeatmapDataQuery = "SELECT symbol, description, examined_Junction, background_major_junction, altexons, proteinpredictions, dpsi, clusterid, uid, chromosome, coord1, coord2, coord3, coord4, eventannotation, ";
			if(sampleResultArr.length > 0)
			{
				for(let i = 0; i < sampleResultArr.length; i++)
				{
					//Strings have to be edited in order to be matched
					var parsedSample = (sampleResultArr[i].replace(/\.|\-/g, "_")).toLowerCase();

					//Add to query string
					if(parsedSample != 'na' && parsedSample != '')
					{
						getHeatmapDataQuery = getHeatmapDataQuery.concat(parsedSample);
					}
					if(i != sampleResultArr.length - 1)
					{
						if(parsedSample != 'na' && parsedSample != '')
						{
							getHeatmapDataQuery = getHeatmapDataQuery.concat(", ");
						}
					}
					else
					{

						if(heatmapQueries.samplesQuery == undefined)
						{
							getHeatmapDataQuery = "SELECT * FROM ".concat(heatmapQueries.cancerTableName).concat("_SPLICE ");
						}
						else
						{	
							let secondToLast = getHeatmapDataQuery.slice(-1);
							if(secondToLast == " ")
							{
								getHeatmapDataQuery = getHeatmapDataQuery.slice(0, -2);
							}
							getHeatmapDataQuery = getHeatmapDataQuery.concat(" FROM ").concat(heatmapQueries.cancerTableName).concat("_SPLICE ");
						}
						//Change UIDSforHeatmapQuery to signatureMatchQuery
						if(signatureUIDSforHeatmapQuery != undefined)//Check for normal signature filter
						{
							getHeatmapDataQuery = getHeatmapDataQuery.concat(signatureUIDSforHeatmapQuery);
						}
						else if(heatmapQueries.geneQuery != undefined)//Check for 
						{
							getHeatmapDataQuery = getHeatmapDataQuery.concat(heatmapQueries.geneQuery);
						}
						else if(heatmapQueries.coordQuery != undefined)//
						{
							getHeatmapDataQuery = getHeatmapDataQuery.concat(heatmapQueries.coordQuery);
						}
					}
				}
			}
			else
			{
				if(heatmapQueries.samplesQuery == undefined)
				{
					getHeatmapDataQuery = "SELECT * FROM ".concat(heatmapQueries.cancerTableName).concat("_SPLICE ");
				}
				else
				{	
					let secondToLast = getHeatmapDataQuery.slice(-1);
					if(secondToLast == " ")
					{
						getHeatmapDataQuery = getHeatmapDataQuery.slice(0, -2);
					}
					getHeatmapDataQuery = getHeatmapDataQuery.concat(" FROM ").concat(heatmapQueries.cancerTableName).concat("_SPLICE ");
				}
				if(signatureUIDSforHeatmapQuery != undefined)//Check for normal signature filter
				{
					getHeatmapDataQuery = getHeatmapDataQuery.concat(signatureUIDSforHeatmapQuery);
				}
				else if(heatmapQueries.geneQuery != undefined)//Check for 
				{
					getHeatmapDataQuery = getHeatmapDataQuery.concat(heatmapQueries.geneQuery);
				}
				else if(heatmapQueries.coordQuery != undefined)//
				{
					getHeatmapDataQuery = getHeatmapDataQuery.concat(heatmapQueries.coordQuery);
				}
			}

			//Remove newline characters (if any) from result
			getHeatmapDataQuery = getHeatmapDataQuery.replace(/\n|\r/g, "");

			var queryResult = await dbCredentials.query(getHeatmapDataQuery);

			outputObject["cancerType"] = req.body.data.cancerName;
			outputObject["oncospliceClusterName"] = heatmapQueries.oncospliceClusterQuery.key;
			outputObject["oncospliceClusterIndices"] = oncospliceClustersDict;

			var generatedUUID = uuid.v4();
			
			clusterDataAndSend(res, queryResult, generatedUUID, outputObject);

		}
		catch(error){
			res.send(error);
			return next(error);
		}
	}
}

module.exports.heatmapData = heatmapData;