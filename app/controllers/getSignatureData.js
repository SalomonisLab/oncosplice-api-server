const fs = require('fs');
const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function getSignatureData(req, res, next){
	if (req.method == 'POST') {
		try{
			const outputObject = {};
			const postedData = req.body.data;
			var cancerType = postedData.cancer;
			var selectedField = postedData.selectedField;
			var prevFields = postedData.prevFields;
			var queryHelperMap = databaseQueryHelper(cancerType);
			let selectedSignatureQuery = queryHelperMap["SIG"]["COUNT"].concat(" WHERE");
			let signatureDataQuery = queryHelperMap["SIG"]["QUERY"].concat(" WHERE");
			let cumulativeSignatureQuery = queryHelperMap["SIG"]["COUNT"].concat(" WHERE");
			let cumulativeSignatureCount = 0;

			selectedField = selectedField.replace("+", "_",);
			selectedSignatureQuery = selectedSignatureQuery.concat(" ").concat(selectedField).concat(" = '1'");
			signatureDataQuery = signatureDataQuery.concat(" ").concat(selectedField).concat(" = '1'");

			prevFields.forEach(field => {
					if(cumulativeSignatureCount != 0)
					{
						field = field.replace("+", "_");
				    	cumulativeSignatureQuery = cumulativeSignatureQuery.concat(" OR ").concat(field).concat(" = '1'");
					}
					else
					{
						field = field.replace("+", "_");
						cumulativeSignatureQuery = cumulativeSignatureQuery.concat(" ").concat(field).concat(" = '1'");
					}
				    cumulativeSignatureCount += 1;				
			})
			let cumulativeSignatureResult = await dbCredentials.query(cumulativeSignatureQuery);
			cumulativeSignatureRows = cumulativeSignatureResult.rows[0]["count"];

			let selectedSignatureResult = await dbCredentials.query(selectedSignatureQuery);
			selectedSignatureNumRows = selectedSignatureResult.rows[0]["count"];

			let signatureDataResult = await dbCredentials.query(signatureDataQuery);

			let signatureDataArray = [];
			let signatureCount = 0;

			signatureDataResult.rows.forEach(row => {
				signatureDataArray[signatureCount] = row["uid"];
				signatureCount += 1;
			})
			outputObject["single"] = selectedSignatureNumRows;
			outputObject["singlequery"] = selectedSignatureQuery;
			outputObject["meta"] = cumulativeSignatureRows;
			outputObject["metaquery"] = cumulativeSignatureQuery;
			outputObject["result"] = signatureDataArray;
			res.send(outputObject);		

		}
		catch(error){
			res.send(error);
			return next(error);
		}
	}
}

module.exports.getSignatureData = getSignatureData;