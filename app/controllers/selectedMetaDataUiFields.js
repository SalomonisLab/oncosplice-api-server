const { dbCredentials } = require("../config/oncodb.config.js");

async function selectedMetaDataUiFields(req, res){
		try{
			const outputObject = {};
			const postedData = req.body.data;
			
		}
		catch(error){
			res.send(error);
			return next(error);
		}
}

module.exports.selectedMetaDataUiFields = selectedMetaDataUiFields;