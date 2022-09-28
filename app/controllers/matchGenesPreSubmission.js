const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function matchGenesPreSubmission(req, res, next){
	if (req.method == 'POST') {
		try{
			let outputObject = {};
			let postedData = req.body.data;
			let queryHelperMap = databaseQueryHelper(postedData.cancerType);
			let geneCountQuery = queryHelperMap["GENE"]["COUNT"].concat(" WHERE");
			let queryCount = 0;
			postedData.genes.forEach(gene => {
				let preGeneQuery = " (symbol = ";
				preGeneQuery = preGeneQuery.concat("'").concat(gene).concat("'");
				preGeneQuery = preGeneQuery.concat(")");
				geneCountQuery = queryCount != 0 ? geneCountQuery.concat(" OR").concat(preGeneQuery) : geneCountQuery.concat(preGeneQuery);
				queryCount += 1;
			})

			let queryResult = await dbCredentials.query(geneCountQuery);
			let numRows = queryResult.rows[0]["count"];

			outputObject["single"] = numRows;
			outputObject["query"] = geneCountQuery;
			res.send(outputObject);
		}
		catch(error){
			res.send(error);
			return next(error);
		}
	}
}

module.exports.matchGenesPreSubmission = matchGenesPreSubmission;