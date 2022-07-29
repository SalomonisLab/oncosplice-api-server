const { dbCredentials } = require("../config/oncodb.config.js");
const { dataBaseQueryHelper } = require("databasequeryhelper.js");
const { removeNewlinesAndUnderscores, changeSpecialCharsToBlank, cleanUpTranslator, convertToUnderscores } = require("../utilities/parsingFunctions.js");

const events = require('events');
const readline = require('readline');
var qs = require('querystring');
const fs = require('fs');

