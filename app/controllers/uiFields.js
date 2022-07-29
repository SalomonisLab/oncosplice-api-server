var qs = require('querystring');
const fs = require('fs');
const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");
const { removeNewlinesAndUnderscores, changeSpecialCharsToBlank, cleanUpTranslator, convertToUnderscores } = require("../utilities/parsingFunctions.js");

async function collectFieldEntries(outputObject, element, queryHelperMap){
		const fieldName = element.name;
		outputObject["meta"][fieldName] = [];
		const fieldEntries =  await dbCredentials.query("SELECT DISTINCT ".concat(fieldName).concat(" FROM ").concat(queryHelperMap["META"]["QUERY"]));
		fieldEntries.rows.forEach((row) => {
			outputObject["meta"][fieldName][row] = row[fieldName];
		});
		return outputObject;
}

async function uiFields(req, res, next){
	if (req.method == 'POST') {
		try{
		const outputObject = {};
		outputObject["meta"] = {};
	    const queryHelperMap = databaseQueryHelper(req.body.data);
	    const clinicalMetadataResult = await dbCredentials.query("SELECT * ".concat(queryHelperMap["META"]["QUERY"]));
	    const promises = clinicalMetadataResult.fields.map(async element => {
	    	const fieldName = element.name;
	    	outputObject["meta"][fieldName] = [];
			const fieldEntries =  await dbCredentials.query("SELECT DISTINCT ".concat(fieldName).concat(" ").concat(queryHelperMap["META"]["QUERY"]));
			fieldEntries.rows.forEach(row => {
				outputObject["meta"][fieldName][outputObject["meta"][fieldName].length] = row[fieldName];
			});
			return fieldEntries;
	    })
	    //The below commented code must be changed to accomodate a no-file system.
		/*				
				fs.readdir(queryHelperMap["META"]["RANGE"], (err, files) => {
					files.forEach(file => {
						if(file == ".DS_Store"){break;}
						var currentFile = queryHelperMap["META"]["RANGE"].concat("/").concat(file);
						currentFileContents = fs.readFileSync(currentFile, 'utf-8');
						content = currentFileContents.split("#");
						refname = currentFile.substring(0, currentFile.length-4);
						refname = changeSpecialCharsToBlank(refname);
						outputObject["range"][refname] = content;
					});
				});

				const sigTranslater = {};
				const strNum = {};
				var sigTranslateFile = queryHelperMap["SIG"]["TRANSLATE"];
				var sigTCount = 0;
				currentFileContents = fs.readFileSync(sigTranslateFile, 'utf-8');
				currentFileContents.split(/\r?\n/).forEach(line =>  {
					if(sigTCount > 0){
						line = line.replaceAll("\n", "");
						line = line.replaceAll("\r", "");
						line = line.split("\t");
						var psiGet = line[1];
						var toSimple = line[2];
						inputString = cleanUpTranslator(inputString);
						sigTranslater[psiGet] = toSimple;
						sigTranslater[toSimple] = psiGet;
						strNum[(sigTCount-1)] = psiGet;
					}
					sigTCount += 1;
				})

				var sigFile = queryHelperMap["SIG"]["COLUMNS"];
				const currentFileContents = fs.readFileSync(sigFile, 'utf-8');
				currentFileContents = convertToUnderscores(currentFileContents);
				currentFileContents = currentFileContents.split("#");
				currentFileContents.shift();
				var sigFields = currentFileContents;
				currentFileContents = "";

				var startCount = sigTCount-1;
				var nonMatchers = [];

				for(let i = 0; i < sigFields.length; i++)
				{
					var found = false;
					for(let j = 0; j < strNum; j++)
					{
						if(sigFields[i] == strNum[j])
						{
							found = true;
							break;
						}
					}
					if(found){continue;}
					else{
						var nonMatcherAmount = nonMatchers.length;
						nonMatchers[nonMatcherAmount] = sigFields[i];
					}
				}

				for(let i = 0; i < nonMatchers.length; i++)
				{
					var strStrCount = strNum.length;
					strNum[strStrCount] = nonMatchers[i];
				}
				
				
				$output_arr["sig"] = $strnum;

				$numrows = $TABLE_DICT[$selected_cancer_type]["SPLC"]["ROWNUM"];
				$numsamples = $TABLE_DICT[$selected_cancer_type]["SPLC"]["COLNUM"];

				$output_arr["sigtranslate"] = $sigtranslater;
				$output_arr["qbox"]["columns"] = $numsamples;
				$output_arr["qbox"]["rows"] = $numrows;


	    });*/
	    const waiting = await Promise.all(promises)
		res.send(outputObject);

		}
		catch(error){
			res.send("nope");
			return next(error);
		}
	}
}

module.exports.uiFields = uiFields;