const fs = require('fs');
const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");
const { removeNewlinesAndUnderscores, changeSpecialCharsToBlank, cleanUpTranslator, convertToUnderscores } = require("../utilities/parsingFunctions.js");
const { containsObject } = require("../utilities/generalFunctions.js")

//This code retrieves the properties of a cancer study. The signatures, clinical metadata, and dataset metrics
//(number of rows and columns) This is used for populating the UI on the front end.
async function samples(req, res, next){
	if (req.method == 'POST') {
		try{
		const outputObject = {};
		outputObject["samples"] = {};
		outputObject["range"] = {};
	    const queryHelperMap = databaseQueryHelper(req.body.data);
	    const clinicalMetadataResult = await dbCredentials.query("SELECT * ".concat(queryHelperMap["META"]["QUERY"]));
	    const promises = clinicalMetadataResult.fields.map(async element => {
	    	const fieldName = element.name;
	    	if(fieldName != "uid"){
	    	outputObject["samples"][fieldName] = {};
	    	outputObject["samples"][fieldName]["values"] = [];
	    	outputObject["samples"][fieldName]["type"] = "notset";
	    	outputObject["samples"][fieldName]["usableUniqueValues"] = [];
			const fieldEntries =  await dbCredentials.query("SELECT DISTINCT ".concat(fieldName).concat(" ").concat(queryHelperMap["META"]["QUERY"]));
			var nonnumset = 0;
			//Find the distinct values of each field and group them appropriately; log numerical/nan values
			//This is for populating the UI appropriately.
			fieldEntries.rows.forEach(row => {
				const metaValueLength = outputObject["samples"][fieldName]["values"].length;
				const metaValue = outputObject["samples"][fieldName]["values"];
				if(outputObject["samples"][fieldName]["type"] != "nonnum")
				{
					if(isNaN(row[fieldName]) == true)
					{
						if(row[fieldName].match(/NA|-|nan|--|---|\s/g) != null || row[fieldName].length == 0){
							outputObject["samples"][fieldName]["type"] = row[fieldName].length <= 3 ? "num" : "nonnum";
						}
						else{
							outputObject["samples"][fieldName]["type"] = "nonnum";
						}
					}
					else if(isNaN(row[fieldName]) == false)
					{
						let usableUniqueValues = outputObject["samples"][fieldName]["usableUniqueValues"];
						usableUniqueValues[usableUniqueValues.length] = parseFloat(row[fieldName]);
						outputObject["samples"][fieldName]["type"] = "num";
					}
					else
					{
						outputObject["samples"][fieldName]["type"] = "nonnum";
					}
				}
				metaValue[metaValueLength] = row[fieldName];
			});
			//Determine whether or not a given field is numerically ranged or not.
			if(outputObject["samples"][fieldName]["usableUniqueValues"].length > 20 && outputObject["samples"][fieldName]["type"] == "num")
			{
				let metaMax = Math.max(...outputObject["samples"][fieldName]["usableUniqueValues"]);
				let metaMin = Math.min(...outputObject["samples"][fieldName]["usableUniqueValues"]);
				let metaRange = metaMax - metaMin;
				let boundary1 = (metaMin + parseInt((metaRange*0.33))).toString();
				let boundary2 = (metaMax - parseInt((metaRange*0.33))).toString();
				outputObject["range"][fieldName] = [metaMin.toString().concat("-").concat(boundary1), boundary1.toString().concat("-").concat(boundary2), boundary2.concat("-").concat(metaMax.toString())];
				//Free up object memory usage
				outputObject["samples"][fieldName]["usableUniqueValues"] = undefined;
			}
			outputObject["samples"][fieldName] = outputObject["samples"][fieldName]["values"];
			return fieldEntries;
			}
	    })

	    var numRows = await dbCredentials.query(queryHelperMap["SPLC"]["COUNT"]);
	    numRows = numRows.rows[0]["count"];
	    const countColSplcQuery = await dbCredentials.query(queryHelperMap["SPLC"]["ONE"]);
	    var numSamples = Object.keys(countColSplcQuery.rows[0]).length - 11;
	    outputObject["qbox"] = {};
	    outputObject["qbox"]["columns"] = numSamples;
	    outputObject["qbox"]["rows"] = numRows;
		await Promise.all(promises);
		res.send(outputObject);

		}
		catch(error){
			res.send(error);
			return next(error);
		}
	}
}

module.exports.samples = samples;