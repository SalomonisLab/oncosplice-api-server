const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function getGtexData(req, res, next){
	if (req.method == 'POST') {
		try{
			var outputObject = {};
			var postUID = req.body.data.uid;
			var gtexQuery = "SELECT * FROM gtex WHERE uid = '".concat(postUID).concat("'");
			var gtexResult = await dbCredentials.query(gtexQuery);

			//For DEBUG only
			//outputObject["postuid"] = postUID;
			//outputObject["splicequery"] = gtexQuery;
			outputObject["result"] = gtexResult.rows;
			res.send(outputObject);
		}
		catch(error){
			res.send(error);
			return next(error);
		}
	}

}

module.exports.getGtexData = getGtexData;