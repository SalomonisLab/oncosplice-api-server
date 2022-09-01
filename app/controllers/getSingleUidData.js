const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function getSingleUidData(req, res, next){
	if (req.method == 'POST') {
		try{
			var outputObject = {};
			var cancerType = req.body.data.cancerType;
			var postUID = req.body.data.uid;
			var queryHelperMap = databaseQueryHelper(cancerType);
			var uidQuery = queryHelperMap["SPLC"]["QUERY"].concat(" WHERE uid = '").concat(postUID).concat("'");
			var uidResult = await dbCredentials.query(uidQuery);

			//For debug only
			//outputObject["splicequery"] = uidQuery;
			outputObject["result"] = uidResult.rows;
			res.send(outputObject);
		}
		catch{
			res.send(error);
			return next(error);			
		}
	}
}

module.exports.getSingleUidData = getSingleUidData;