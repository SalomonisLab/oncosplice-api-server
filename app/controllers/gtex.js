const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function gtex(req, res, next){
	if (req.method == 'POST') {
		try{
			var outputObject = {};
			var postUID = req.body.data.uid;
			var gtexQuery = "SELECT * FROM gtex WHERE uid = '".concat(postUID).concat("'");
			var gtexResult = await dbCredentials.query(gtexQuery);

			var mArrCount = 0;
			var mArr = [];

			gtexResult.rows.forEach(row => {
				mArr[mArrCount] = row;
				mArrCount += 1;
			})

			outputObject["postuid"] = postUID;
			outputObject["splicequery"] = gtexQuery;
			outputObject["result"] = mArr;
			res.send(outputObject);
		}
		catch(error){
			res.send(error);
			return next(error);
		}
	}

}

module.exports.gtex = gtex;