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
			let singleBaseQuery = queryHelperMap["SIG"]["COUNT"].concat(" WHERE");
			let singleFullBaseQuery = queryHelperMap["SIG"]["QUERY"].concat(" WHERE");
			let singleBaseFlag = 0;
			let metaBaseQuery = queryHelperMap["SIG"]["COUNT"].concat(" WHERE");
			let metaBaseCount = 0;

			selectedField = selectedField.replace("+", "_",);
			singleBaseQuery = singleBaseQuery.concat(" ").concat(selectedField).concat(" = '1'");
			singleFullBaseQuery = singleFullBaseQuery.concat(" ").concat(selectedField).concat(" = '1'");

			prevFields.forEach(field => {
					if(metaBaseCount != 0)
					{
						field = field.replace("+", "_");
				    	metaBaseQuery = metaBaseQuery.concat(" OR ").concat(field).concat(" = '1'");
					}
					else
					{
						field = field.replace("+", "_");
						metaBaseQuery = metaBaseQuery.concat(" ").concat(field).concat(" = '1'");
					}
				    metaBaseCount = metaBaseCount + 1;				
			})
			let metaResult = await dbCredentials.query(metaBaseQuery);
			metaNumRows = metaResult.rows[0]["count"];

			let singleResult = await dbCredentials.query(singleBaseQuery);
			singleNumRows = singleResult.rows[0]["count"];

			let singleFullResult = await dbCredentials.query(singleFullBaseQuery);

			let singleArray = [];
			let singleCount = 0;

			singleFullResult.rows.forEach(row => {
				singleArray[singleCount] = row["uid"];
				singleCount += 1;
			})
			outputObject["single"] = singleNumRows;
			outputObject["singlequery"] = singleBaseQuery;
			outputObject["meta"] = metaNumRows;
			outputObject["metaquery"] = metaBaseQuery;
			outputObject["result"] = singleArray;
			res.send(outputObject);		

		}
		catch(error){
			res.send(error);
			return next(error);
		}
	}
}

module.exports.getSignatureData = getSignatureData;