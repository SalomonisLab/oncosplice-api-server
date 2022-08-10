var qs = require('querystring');
const fs = require('fs');
const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");
const { removeNewlinesAndUnderscores, changeSpecialCharsToBlank, cleanUpTranslator, convertToUnderscores } = require("../utilities/parsingFunctions.js");
const { containsObject } = require("../utilities/generalFunctions.js")

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
	    const sigTranslater = {};
	    const sigNamesList = [];
		const sigTranslateQuery = await dbCredentials.query(queryHelperMap["SIG"]["TRANSLATE"]);
		sigTranslateQuery.rows.forEach(row => {
			let psiEventSignature = (cleanUpTranslator(row["psi_event_signatures"])).toLowerCase();
			let simpleName = row["simple_name"]
			sigNamesList.push(psiEventSignature);
			sigTranslater[psiEventSignature] = simpleName;
			sigTranslater[simpleName] = psiEventSignature;
		})
		//sigTranslateQuery
		outputObject["sigtranslate"] = sigTranslater;

		const sigNamesQuery = await dbCredentials.query(queryHelperMap["SIG"]["QUERY"]);
		sigNamesQuery.fields.forEach(element => {
			let fieldName = element["name"];
			if(fieldName != "uid"){
				if(containsObject(fieldName, sigNamesList) == false)
				{
					sigNamesList.push(fieldName);
				}
			}
		})

		outputObject["sig"] = sigNamesList;

	    var numRows = await dbCredentials.query(queryHelperMap["SPLC"]["COUNT"]);
	    numRows = numRows.rows[0]["count"];
	    const countColSplcQuery = await dbCredentials.query(queryHelperMap["SPLC"]["ONE"]);
	    var numSamples = Object.keys(countColSplcQuery.rows[0]).length - 11;
	    outputObject["qbox"] = {};
	    outputObject["qbox"]["columns"] = numSamples;
	    outputObject["qbox"]["rows"] = numRows;
		await Promise.all(promises);
		/*				
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