const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function getSingleUID(req, res){
	if (req.method == 'POST') {
		try{
			var outputObject = {};
			var cancerType = req.body.data.cancerType;
			var postUID = req.body.data.uid;
			var queryHelperMap = databaseQueryHelper(cancerType);
			var uidQuery = queryHelperMap["SPLC"]["QUERY"].concat(" WHERE uid = '").concat(postUID).concat("'");
			var uidResult = await dbCredentials.query(uidQuery);
			var mArrCount = 0;
			var mArr = [];

			uidResult.rows.forEach(row => {
				mArr[mArrCount] = row;
				mArrCount += 1;
			})

			outputObject["postuid"] = postUID;
			outputObject["splicequery"] = uidQuery;
			outputObject["result"] = mArr;
			res.send(outputObject);
		}
		catch{
			res.send(error);
			return next(error);			
		}
	}
}

module.exports.getSingleUID = getSingleUID;