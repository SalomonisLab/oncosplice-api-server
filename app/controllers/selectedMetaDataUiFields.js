const fs = require('fs');
const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function selectedMetaDataUiFields(req, res, next){
	if (req.method == 'POST') {
		try{
			const outputObject = {};
			const postedData = req.body.data;
			const cancerType = postedData.cancerType;
			const selectedField = postedData.selectedField;
			const prevFields = postedData.prevFields;
			const queryHelperMap = databaseQueryHelper(cancerType);
			var singleBaseQuery = "SELECT COUNT(*) ".concat(queryHelperMap["META"]["QUERY"]).concat(" WHERE");
			var singleBaseFlag = 0;
			var metaBaseQuery = "SELECT COUNT(*) ".concat(queryHelperMap["META"]["QUERY"]).concat(" WHERE");
			var metaBaseCount = 0;
			singleBaseFlag = 1;
			//Check to see if the selected field has range or not.
			if(selectedField.value.indexOf("-") != -1)
			{
				var numberstosearch = selectedField.value.split("-");
				singleBaseQuery = singleBaseQuery.concat(" ").concat(selectedField.key).concat(" >= '").concat(numberstosearch[0]).concat("'");
				singleBaseQuery = singleBaseQuery.concat(" AND ").concat(selectedField.key).concat(" <= '").concat(numberstosearch[1]).concat("'");
			}
			else
			{
				singleBaseQuery = singleBaseQuery.concat(" ").concat(selectedField.key).concat(" = '").concat(selectedField.value).concat("'");
			}

			console.log("singleBaseQuery", singleBaseQuery);
			
			prevFields.forEach(field => {
				if(field.key.indexOf("-") != -1)
				{
					var numberstosearch = field.value.split("-");
					if(metaBaseCount != 0)
					{
						metaBaseQuery = metaBaseQuery.concat(" AND ").concat(field.key).concat(" >= '").concat(numberstosearch[0]).concat("'");
					}
					else
					{
						metaBaseQuery = metaBaseQuery.concat(" ").concat(field.key).concat(" >= '").concat(numberstosearch[0]).concat("'");
					}
					metaBaseCount = metaBaseCount + 1;
					metaBaseQuery = metaBaseQuery.concat(" AND ").concat(field.key).concat(" <= '").concat(numberstosearch[1]).concat("'");
					metaBaseCount = metaBaseCount + 1;
				}
				else
				{
					if(metaBaseCount != 0)
					{
						metaBaseQuery = metaBaseQuery.concat(" AND ").concat(field.key).concat(" = '").concat(field.value).concat("'");
					}
					else
					{
						metaBaseQuery = metaBaseQuery.concat(" ").concat(field.key).concat(" = '").concat(field.value).concat("'");
					}
					metaBaseCount = metaBaseCount + 1;
				}				
			})

			//First query for sample ids. Will need to be changed to be contructed in depth.
	    	const prevMetadataResult = await dbCredentials.query(metaBaseQuery);

			var metaNumRows = prevMetadataResult.rows[0]["count"];
			var singleResult = 0;
			var singleNumRows = 0;
			if(singleBaseFlag != 0)
			{
				singleResult = await dbCredentials.query(singleBaseQuery);
				singleNumRows = singleResult.rows[0]["count"];
			}
			else
			{
				singleNumRows = 0;
			}
			outputObject["single"] = singleNumRows;
			outputObject["singlequery"] = singleBaseQuery;
			outputObject["meta"] = metaNumRows;
			outputObject["metaquery"] = metaBaseQuery;
			res.send(outputObject);
		}
		catch(error){
			res.send(error);
			return next(error);
		}
	}
}

module.exports.selectedMetaDataUiFields = selectedMetaDataUiFields;