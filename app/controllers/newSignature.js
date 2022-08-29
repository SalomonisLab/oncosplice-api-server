const fs = require('fs');
const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

//This function records the number of samples that exist for a given selection.
async function newSignature(req, res, next){
	if (req.method == 'POST') {
		try{
			let outputObject = {};
			let postedData = req.body.data;
			let cancerType = postedData.cancerType;
			let queryHelperMap = databaseQueryHelper(postedData.cancerType);
			
			const sigTranslateQuery = await dbCredentials.query(queryHelperMap["SIG"]["TRANSLATE"]);
			sigTranslateQuery.rows.forEach(row => {
				let psiEventSignature = (cleanUpTranslator(row["psi_event_signatures"])).toLowerCase();
				let simpleName = row["simple_name"]
				sigNamesList.push(psiEventSignature);
				sigTranslater[psiEventSignature] = simpleName;
				sigTranslater[simpleName] = psiEventSignature;
			})

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
			outputObject["sigtranslate"] = sigTranslater;
			res.send(outputObject);	
		}
		catch(error){
			res.send(error);
			return next(error);
		}
	}
}

module.exports.newSignature = newSignature;