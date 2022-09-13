const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function cbioportalStudyTranslate(req, res, next){
	if (req.method == 'POST') {
		try{
			var outputObject = {};
			var cancerType = req.body.data.cancerType;

			var query = "SELECT * FROM cbioportalCancerStudies WHERE oncosplice = '".concat(cancerType).concat("'");
			var queryResult = await dbCredentials.query(query);
			var outputStudy = queryResult.rows[0]["cbioportal"];

			res.send(outputStudy);
		}
		catch(error){
			res.send(error);
			return next(error);			
		}
	}
}

module.exports.cbioportalStudyTranslate = cbioportalStudyTranslate;