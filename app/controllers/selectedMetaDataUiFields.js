const fs = require('fs');
const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

//This function records the number of samples that exist for a given selection.
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
				//Check to see if the current field has range or not.
				if(field.key.indexOf("-") != -1)
				{
					var numberstosearch = field.value.split("-");
					let metaSuffixQuery = field.key.concat(" >= '").concat(numberstosearch[0]).concat("'");
					metaBaseQuery = metaBaseCount != 0 ? metaBaseQuery.concat(" AND ") : metaBaseQuery.concat(" ");
					metaBaseQuery = metaBaseQuery.concat(metaSuffixQuery);
					metaBaseQuery = metaBaseQuery.concat(" AND ").concat(field.key).concat(" <= '").concat(numberstosearch[1]).concat("'");
					metaBaseCount += 2;
				}
				else
				{
					let metaSuffixQuery = field.key.concat(" = '").concat(field.value).concat("'");
					metaBaseQuery = metaBaseCount != 0 ? metaBaseQuery.concat(" AND ") : metaBaseQuery.concat(" ");
					metaBaseQuery = metaBaseQuery.concat(metaSuffixQuery);
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