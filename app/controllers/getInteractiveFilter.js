const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function getInteractiveFilter(req, res, next){
	if (req.method == 'POST') {
		try{
			var outputObject = {};
			var cancerType = req.body.data.cancerType;
			var postName = req.body.data.name;
			var queryHelperMap = databaseQueryHelper(cancerType);
			var set = [];
			var color_push = {};
			var returned_result = {};
			var i_set = 0;
			var clinicalMetaDataQuery = "SELECT ".concat(postName.toLowerCase()).concat(", uid ").concat(queryHelperMap["META"]["QUERY"]);
			var clinicalMetaDataResult = await dbCredentials.query(clinicalMetaDataQuery);

			clinicalMetaDataResult.rows.forEach(row => {
				var str_edit = (row['uid'].replace(/\.|\-/g, "_")).toLowerCase();
				returned_result[str_edit] = row[postName.toLowerCase()];
				var found_flag = 0;
			    for(let k = 0; k < set.length; k++)
			    {
			    	if(set[k] ==  row[postName.toLowerCase()])
			    	{
			    		found_flag = 1;
			    	}
			    }
			    if(found_flag == 0)
			    {
			    	set[i_set] = row[postName.toLowerCase()];
			    	i_set += 1;
			    }
			})

			for(let k = 0; k < set.length; k++)
			{
				color_push[set[k]] = k;
			}

			outputObject["set"] = set;
			outputObject["out"] = returned_result;
			outputObject["color"] = color_push;
			res.send(outputObject);
		}
		catch(error){
			res.send(error);
			return next(error);			
		}
	}
}

module.exports.getInteractiveFilter = getInteractiveFilter;