const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function matchCoordinatesPreSubmission(req, res, next){
	if (req.method == 'POST') {
		try{
			let outputObject = {};
			let postedData = req.body.data;

			let queryHelperMap = databaseQueryHelper(postedData.cancerType);
			let coordCountQuery = queryHelperMap["COORD"]["COUNT"].concat(" WHERE");
			let queryCount = 0;
			postedData.coords.forEach(coord => {
				coord = coord.replace(/\r|\n/g, "")
				let coord1ChrmSplit = coord.split(":");
				let coord1Chrm = coord1ChrmSplit[0];
				let coord1PosSplit = coord1ChrmSplit[1].split("-");

				let coord1Start = coord1PosSplit[0];
				let coord1End = coord1PosSplit[1];

				let preCoordQuery = " ((chromosome = ";
				preCoordQuery = preCoordQuery.concat("'").concat(coord1Chrm).concat("'");
				preCoordQuery = preCoordQuery.concat(") AND ((coord1 = ").concat("'").concat(coord1Start).concat("'");
				preCoordQuery = preCoordQuery.concat(" OR coord2 = ").concat("'").concat(coord1Start).concat("'");
				preCoordQuery = preCoordQuery.concat(" OR coord3 = ").concat("'").concat(coord1Start).concat("'");
				preCoordQuery = preCoordQuery.concat(" OR coord4 = ").concat("'").concat(coord1Start).concat("'");
				preCoordQuery = preCoordQuery.concat(") OR (coord1 = ").concat("'").concat(coord1End).concat("'");
				preCoordQuery = preCoordQuery.concat(" OR coord2 = ").concat("'").concat(coord1End).concat("'");
				preCoordQuery = preCoordQuery.concat(" OR coord3 = ").concat("'").concat(coord1End).concat("'");
				preCoordQuery = preCoordQuery.concat(" OR coord4 = ").concat("'").concat(coord1End).concat("'");
				preCoordQuery = preCoordQuery.concat(")))");

				coordCountQuery = queryCount != 0 ? coordCountQuery.concat(" OR").concat(preCoordQuery) : coordCountQuery.concat(preCoordQuery);
				queryCount += 1;
			})

			let queryResult = await dbCredentials.query(coordCountQuery);
			let numRows = queryResult.rows[0]["count"];

			outputObject["single"] = numRows;
			outputObject["query"] = coordCountQuery;
			res.send(outputObject);
		}
		catch(error){
			res.send(error);
			return next(error);
		}
	}
}

module.exports.matchCoordinatesPreSubmission = matchCoordinatesPreSubmission;