const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function getExonViewerData(req, res, next){
	if (req.method == 'POST') {
		try{
			var outputObject = {};
			var postedData = req.body.data;

			//Remove select *, only select needed columns
			var exonQuery = "SELECT exon_id, exon_region_start_s_, exon_region_stop_s_, splice_junctions, ens_exon_ids FROM HS_EXON WHERE gene = '".concat(postedData.gene).concat("';");
			var exonResult = await dbCredentials.query(exonQuery);

			var downloadableBlobArrGeneModelCount = 0;
			var downloadableBlobArrTranscriptsCount = 0;
			var downloadableBlobArrJunctionsCount = 0;
			var downloadableBlobArr = {};
			downloadableBlobArr["genemodel"] = [];
			downloadableBlobArr["trans"] = [];
			downloadableBlobArr["junc"] = [];

			var geneModelArrayCount = 0;
			var geneModelArray = [];

			exonResult.rows.forEach(row => {
				geneModelArray[geneModelArrayCount] = {};
			    geneModelArray[geneModelArrayCount]["exon_name"] = row["exon_id"];
			    geneModelArray[geneModelArrayCount]["start"] = row["exon_region_start_s_"];
			    geneModelArray[geneModelArrayCount]["stop"] = row["exon_region_stop_s_"];
			    geneModelArray[geneModelArrayCount]["splice_junctions"] = row["splice_junctions"];
			    geneModelArray[geneModelArrayCount]["ensembl_exon_id"] = row["ens_exon_ids"];
			    downloadableBlobArr["genemodel"][downloadableBlobArrGeneModelCount] = row;
			    geneModelArrayCount += 1;
			    downloadableBlobArrGeneModelCount += 1;
			});

			var transcriptQuery = "SELECT ensembl_transcript_id, exon_start__bp_ FROM HS_TRANSCRIPT_ANNOT WHERE ensembl_gene_id = '".concat(postedData.gene).concat("';");
			var transResult = await dbCredentials.query(transcriptQuery);

			var transcriptsCount = 0;
			var transcriptsArray = {};

			transResult.rows.forEach(row => {
				let currentTranscript = row["ensembl_transcript_id"];
				transcriptsArray[currentTranscript] = [];
			    transcriptsArray[currentTranscript][transcriptsArray[currentTranscript].length] = row["exon_start__bp_"];
			    downloadableBlobArr["trans"][downloadableBlobArrTranscriptsCount] = row;
			    downloadableBlobArrTranscriptsCount += 1;				
			});

			var juncQuery = "SELECT exon_id, ens_exon_ids, exon_region_start_s_, exon_region_stop_s_, strand FROM HS_JUNC WHERE gene = '".concat(postedData.gene).concat("';");
			var juncResult = await dbCredentials.query(juncQuery);

			var junctionsArrayCount = 0;
			var junctionsArray = [];

			juncResult.rows.forEach(row => {
				junctionsArray[junctionsArrayCount] = {};
			    junctionsArray[junctionsArrayCount]["junction"] = row["exon_id"];
			    junctionsArray[junctionsArrayCount]["ensembl_exon_id"] = row["ens_exon_ids"];
			    junctionsArray[junctionsArrayCount]["start"] = row["exon_region_start_s_"];
			    junctionsArray[junctionsArrayCount]["stop"] = row["exon_region_stop_s_"];
			    junctionsArray[junctionsArrayCount]["strand"] = row["strand"];
			    downloadableBlobArr["junc"][downloadableBlobArrJunctionsCount] = row;
			    downloadableBlobArrJunctionsCount += 1;
			    junctionsArrayCount += 1;
			});

			outputObject["gene"] = geneModelArray;
			outputObject["transcript"] = transcriptsArray;
			outputObject["junc"] = junctionsArray;
			outputObject["blob"] = downloadableBlobArr;

			res.send(outputObject);
		}
		catch(error){
			res.send(error);
			return next(error);
		}
	}

}

module.exports.getExonViewerData = getExonViewerData;