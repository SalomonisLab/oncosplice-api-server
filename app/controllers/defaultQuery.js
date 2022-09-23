const fs = require('fs');
const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");
const { removeNewlinesAndUnderscores, changeSpecialCharsToBlank, cleanUpTranslator, convertToUnderscores } = require("../utilities/parsingFunctions.js");
const { containsObject } = require("../utilities/generalFunctions.js")

async function defaultQuery(req, res, next){
	if (req.method == 'POST') {
        try{
            fs.readFile('./output.json', 'utf8', (error, data) => {
                if(error){
                   console.log(error);
                   return;
                }
                res.send(JSON.parse(data));
           
           })            
        }
		catch(error){
			res.send(error);
			return next(error);
		}
    }
}
module.exports.defaultQuery = defaultQuery;