const { dbCredentials } = require("../config/oncodb.config.js");
const { cleanUpTranslator } = require("../utilities/parsingFunctions.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");
const { containsObject } = require("../utilities/generalFunctions.js")

//This function records the number of samples that exist for a given selection.
async function signatures(req, res, next){
	if (req.method == 'POST') {
		try{
			let outputObject = {};
			let postedData = req.body.data;
			let queryHelperMap = databaseQueryHelper(postedData.cancerType);
			let sigNamesList = [];
			let sigTranslater = {};
			
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
						sigTranslater[fieldname] = undefined;
					}
				}
			})

			outputObject["signatureTranslate"] = sigTranslater;
			res.send(outputObject);	
		}
		catch(error){
			res.send(error);
			return next(error);
		}
	}
}

module.exports.signatures = signatures;