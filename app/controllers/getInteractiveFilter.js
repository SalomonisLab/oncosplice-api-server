const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function getInteractiveFilter(req, res, next){
	if (req.method == 'POST') {
		try{
			var outputObject = {};
			var cancerType = req.body.data.cancerType;
			var selectedFilterName = req.body.data.name;
			var queryHelperMap = databaseQueryHelper(cancerType);
			var set = [];
			var colorMatchArray = {};
			var outputArray = {};
			var iSet = 0;
			var clinicalMetaDataQuery = "SELECT ".concat(selectedFilterName.toLowerCase()).concat(", uid ").concat(queryHelperMap["META"]["QUERY"]);
			var clinicalMetaDataResult = await dbCredentials.query(clinicalMetaDataQuery);

			clinicalMetaDataResult.rows.forEach(row => {
				var str_edit = (row['uid'].replace(/\.|\-/g, "_")).toLowerCase();
				outputArray[str_edit] = row[selectedFilterName.toLowerCase()];
				var foundFlag = 0;
			    for(let k = 0; k < set.length; k++)
			    {
			    	if(set[k] ==  row[selectedFilterName.toLowerCase()])
			    	{
			    		foundFlag = 1;
			    	}
			    }
			    if(foundFlag == 0)
			    {
			    	set[iSet] = row[selectedFilterName.toLowerCase()];
			    	iSet += 1;
			    }
			})

			for(let k = 0; k < set.length; k++)
			{
				colorMatchArray[set[k]] = k;
			}

			outputObject["set"] = set;
			outputObject["out"] = outputArray;
			outputObject["color"] = colorMatchArray;
			res.send(outputObject);
		}
		catch(error){
			res.send(error);
			return next(error);			
		}
	}
}

module.exports.getInteractiveFilter = getInteractiveFilter;