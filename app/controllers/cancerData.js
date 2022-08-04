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

async function cancerData(req, res, next){
	if (req.method == 'POST') {
		try{
		const outputObject = {};
		outputObject["meta"] = {};
		outputObject["range"] = {};
	    const queryHelperMap = databaseQueryHelper(req.body.data);
	    const clinicalMetadataResult = await dbCredentials.query("SELECT * ".concat(queryHelperMap["META"]["QUERY"]));
	    const promises = clinicalMetadataResult.fields.map(async element => {
	    	const fieldName = element.name;
	    	outputObject["meta"][fieldName] = {};
	    	outputObject["meta"][fieldName]["values"] = [];
	    	outputObject["meta"][fieldName]["type"] = "notset";
	    	outputObject["meta"][fieldName]["usableUniqueValues"] = [];
			const fieldEntries =  await dbCredentials.query("SELECT DISTINCT ".concat(fieldName).concat(" ").concat(queryHelperMap["META"]["QUERY"]));
			var nonnumset = 0;
			fieldEntries.rows.forEach(row => {
				//console.log("ROWPRINT", row[fieldName]);
				const metaValueLength = outputObject["meta"][fieldName]["values"].length;
				const metaValue = outputObject["meta"][fieldName]["values"];
				//console.log(isNaN(row[fieldName]), "MATCHFAIL");
				if(outputObject["meta"][fieldName]["type"] != "nonnum")
				{
					if(isNaN(row[fieldName]) == true)
					{
						if(row[fieldName].match(/NA|-|nan|--|---|\s/g) != null || row[fieldName].length == 0){
							outputObject["meta"][fieldName]["type"] = "num";
						}
						else{
							//console.log(row[fieldName].match(/NA|-|nan|--|---|\s/g), "MATCHFAIL");
							outputObject["meta"][fieldName]["type"] = "nonnum";
						}
					}
					else if(isNaN(row[fieldName]) == false)
					{
						let usableUniqueValues = outputObject["meta"][fieldName]["usableUniqueValues"];
						usableUniqueValues[usableUniqueValues.length] = parseFloat(row[fieldName]);
						outputObject["meta"][fieldName]["type"] = "num";
					}
					else
					{
						outputObject["meta"][fieldName]["type"] = "nonnum";
					}
				}
				metaValue[metaValueLength] = row[fieldName];
			});
			if(outputObject["meta"][fieldName]["usableUniqueValues"].length > 20 && outputObject["meta"][fieldName]["type"] == "num")
			{
				let metaMax = Math.max(...outputObject["meta"][fieldName]["usableUniqueValues"]);
				let metaMin = Math.min(...outputObject["meta"][fieldName]["usableUniqueValues"]);
				let metaRange = metaMax - metaMin;
				let boundary1 = (metaMin + parseInt((metaRange*0.33))).toString();
				let boundary2 = (metaMax - parseInt((metaRange*0.33))).toString();
				outputObject["range"][fieldName] = [metaMin.toString().concat("-").concat(boundary1), boundary1.toString().concat("-").concat(boundary2), boundary2.concat("-").concat(metaMax.toString())];
			}
			return fieldEntries;
	    })
		await Promise.all(promises);


		/*fs.readdir(queryHelperMap["META"]["RANGE"], (err, files) => {
			files.forEach(file => {
				if(file == ".DS_Store"){break;}
				var currentFile = queryHelperMap["META"]["RANGE"].concat("/").concat(file);
				currentFileContents = fs.readFileSync(currentFile, 'utf-8');
				content = currentFileContents.split("#");
				refname = currentFile.substring(0, currentFile.length-4);
				refname = changeSpecialCharsToBlank(refname);
				outputObject["range"][refname] = content;
			});
		});*/
	    //The below commented code must be changed to accomodate a no-file system.
		/*
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
	    
		res.send(outputObject);

		}
		catch(error){
			res.send(error);
			return next(error);
		}
	}
}

module.exports.cancerData = cancerData;