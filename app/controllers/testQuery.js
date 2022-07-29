const { dbCredentials } = require("../config/oncodb.config.js");

async function testQuery(req, res){
  try {
    const resultOfQuery = await dbCredentials.query("SELECT * FROM GBM_TCGA_SPLICE LIMIT 3;");
    res.send(resultOfQuery);
    /*res.json({
    	data: resultOfQuery
    })*/
  } catch (error) {
    res.send([4, 5, 6]);
  }
}

module.exports.testQuery = testQuery;