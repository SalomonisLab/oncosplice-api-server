var qs = require('querystring');
const fs = require('fs');
const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");
const { removeNewlinesAndUnderscores, changeSpecialCharsToBlank, cleanUpTranslator, convertToUnderscores } = require("../utilities/parsingFunctions.js");

async function cancerData(req, res, next){
	if (req.method == 'POST') {
		try{
		const outputObject = {};
		outputObject["meta"] = {};
	    const queryHelperMap = databaseQueryHelper(req.body.data);
	    const clinicalMetadataResult = await dbCredentials.query("SELECT * ".concat(queryHelperMap["META"]["QUERY"]));
	    const promises = clinicalMetadataResult.fields.map(async element => {
	    	const fieldName = element.name;
	    	outputObject["meta"][fieldName]["values"] = [];
	    	outputObject["meta"][fieldName]["type"] = "notset";
	    	outputObject["meta"][fieldName]["usableUniqueValues"] = [];
			const fieldEntries =  await dbCredentials.query("SELECT DISTINCT ".concat(fieldName).concat(" ").concat(queryHelperMap["META"]["QUERY"]));
			fieldEntries.rows.forEach(row => {
				const metaValueLength = outputObject["meta"][fieldName]["values"].length;
				const metaValue = outputObject["meta"][fieldName]["values"];
				if(outputObject["meta"][fieldName]["type"] != "nonnum")
				{
					if(typeof metaValue == "string")
					{
						if(metaValue == /NA|-|nan|--|---|\s/g || metaValue.length == 0){
							continue;
						}
						else{
							outputObject["meta"][fieldName]["type"] = "nonnum";
						}
					}
					else if(typeof metaValue == "number")
					{
						let usableUniqueValues = outputObject["meta"][fieldName]["usableUniqueValues"];
						usableUniqueValues[usableUniqueValues.length] = metaValue;
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
				let metaMax = parseInt(Math.max(outputObject["meta"][fieldName]["usableUniqueValues"]));
				let metaMin = parseInt(Math.min(outputObject["meta"][fieldName]["usableUniqueValues"]));
				let metaRange = metaMax - metaMin;
				let boundary1 = (metaMin + parseInt((metaRange*0.33))).toString();
				let boundary2 = (metaMax - parseInt((metaRange*0.33))).toString();
				outputObject["range"][fieldName] = [metaMin.toString().concat("-").concat(boundary1), boundary1.toString().concat("-").concat(boundary2), boundary2.concat("-").concat(metaMax.toString())];
			}
			return fieldEntries;
	    })
		
	    const sigTranslater = {};
		const sigTranslateQuery = await dbCredentials.query("SELECT * ".concat(queryHelperMap["META"]["QUERY"]));

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
	    await Promise.all(promises);
		res.send(outputObject);

		}
		catch(error){
			res.send("nope");
			return next(error);
		}
	}
}

module.exports.cancerData = cancerData;