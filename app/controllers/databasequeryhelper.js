function databaseQueryHelper(cancerName)
{
	var cancerQuerySuffix = cancerName == "AML_Leucegene" ? "" : "_TCGA";
	const queryHelperMap = {
		"META" : {
			"QUERY" : "FROM ".concat(cancerName).concat(cancerQuerySuffix).concat("_META"),
			"COLUMNS" : cancerName.concat("/Columns"),
			"RANGE" : cancerName.concat("/Range")
		},
		"SIG" : {
			"QUERY" : "SELECT * FROM ".concat(cancerName).concat(cancerQuerySuffix).concat("_SIGNATURE"),
			"COLUMNS" : cancerName.concat("/oncofields.txt"),
			"TRANSLATE" : "SELECT * FROM SIGTRANSLATE WHERE cancer = '".concat(cancerName).concat(cancerQuerySuffix).concat("'")
		},
		"SPLC" : {
			"QUERY" : "SELECT * FROM ".concat(cancerName).concat(cancerQuerySuffix).concat("_SPLC")
		}
	}
	return queryHelperMap;
}

module.exports.databaseQueryHelper = databaseQueryHelper;