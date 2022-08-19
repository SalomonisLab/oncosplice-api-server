const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function signatureList(req, res, next){
	console.log("not implemented");
}

module.exports.signatureList = signatureList;