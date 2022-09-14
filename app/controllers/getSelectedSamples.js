const fs = require('fs');
const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

//This function records the number of samples that exist for a given selection.
async function getSelectedSamples(req, res, next){
	if (req.method == 'POST') {
		try{
			const outputObject = {};
			const postedData = req.body.data;
			const cancerType = postedData.cancerType;
			const selectedField = postedData.selectedField;
			const prevFields = postedData.prevFields;
			const queryHelperMap = databaseQueryHelper(cancerType);
			var selectedSampleQuery = "SELECT COUNT(*) ".concat(queryHelperMap["META"]["QUERY"]).concat(" WHERE");
			var cumulativeSampleQuery = "SELECT COUNT(*) ".concat(queryHelperMap["META"]["QUERY"]).concat(" WHERE");
			var cumulativeSampleCount = 0;

			//Check to see if the selected field has range or not.
			if(selectedField.value.indexOf("-") != -1)
			{
				let numbersOfRange = selectedField.value.split("-");
				selectedSampleQuery = selectedSampleQuery.concat(" ").concat(selectedField.key).concat(" >= '").concat(numbersOfRange[0]).concat("'");
				selectedSampleQuery = selectedSampleQuery.concat(" AND ").concat(selectedField.key).concat(" <= '").concat(numbersOfRange[1]).concat("'");
			}
			else
			{
				selectedSampleQuery = selectedSampleQuery.concat(" ").concat(selectedField.key).concat(" = '").concat(selectedField.value).concat("'");
			}

			console.log("selectedSampleQuery", selectedSampleQuery);
			
			prevFields.forEach(field => {
				//Check to see if the current field has range or not.
				if(field.key.indexOf("-") != -1)
				{
					let numbersOfRange = field.value.split("-");
					let cumulativeQuerySuffix = field.key.concat(" >= '").concat(numbersOfRange[0]).concat("'");
					cumulativeSampleQuery = cumulativeSampleCount != 0 ? cumulativeSampleQuery.concat(" AND ") : cumulativeSampleQuery.concat(" ");
					cumulativeSampleQuery = cumulativeSampleQuery.concat(cumulativeQuerySuffix);
					cumulativeSampleQuery = cumulativeSampleQuery.concat(" AND ").concat(field.key).concat(" <= '").concat(numbersOfRange[1]).concat("'");
					cumulativeSampleCount += 2;
				}
				else
				{
					let cumulativeQuerySuffix = field.key.concat(" = '").concat(field.value).concat("'");
					cumulativeSampleQuery = cumulativeSampleCount != 0 ? cumulativeSampleQuery.concat(" AND ") : cumulativeSampleQuery.concat(" ");
					cumulativeSampleQuery = cumulativeSampleQuery.concat(cumulativeQuerySuffix);
					cumulativeSampleCount += 1;
				}				
			})

			//First query for sample ids. Will need to be changed to be contructed in depth.
	    	const cumulativeSampleResult = await dbCredentials.query(cumulativeSampleQuery);

			var cumulativeSampleRows = cumulativeSampleResult.rows[0]["count"];
			var singleResult = 0;
			var singleNumRows = 0;
			selectedSampleResult = await dbCredentials.query(selectedSampleQuery);
			selectedSampleNumRows = selectedSampleResult.rows[0]["count"];

			outputObject["single"] = selectedSampleNumRows;
			outputObject["singlequery"] = selectedSampleQuery;
			outputObject["meta"] = cumulativeSampleRows;
			outputObject["metaquery"] = cumulativeSampleQuery;
			res.send(outputObject);
		}
		catch(error){
			res.send(error);
			return next(error);
		}
	}
}

module.exports.getSelectedSamples = getSelectedSamples;