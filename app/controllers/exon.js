const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function exon(req, res, next){
	if (req.method == 'POST') {
		try{
			var outputObject = {};
			var postedData = req.body.data;

			var exonQuery = "SELECT * FROM HS_EXON WHERE gene = '".concat(postedData.gene).concat("';");
			var exonResult = await dbCredentials.query(exonQuery);

			var blob_arr_gm_count = 0;
			var blob_arr_tr_count = 0;
			var blob_arr_j_count = 0;
			var blob_arr = {};
			blob_arr["genemodel"] = [];
			blob_arr["trans"] = [];
			blob_arr["junc"] = [];

			var m_arr_count = 0;
			var m_arr = [];

			exonResult.rows.forEach(row => {
				m_arr[m_arr_count] = {};
			    m_arr[m_arr_count]["exon_name"] = row["exon_id"];
			    m_arr[m_arr_count]["start"] = row["exon_region_start_s_"];
			    m_arr[m_arr_count]["stop"] = row["exon_region_stop_s_"];
			    m_arr[m_arr_count]["splice_junctions"] = row["splice_junctions"];
			    m_arr[m_arr_count]["ensembl_exon_id"] = row["ens_exon_ids"];
			    blob_arr["genemodel"][blob_arr_gm_count] = row;
			    m_arr_count = m_arr_count + 1;
			    blob_arr_gm_count = blob_arr_gm_count + 1;
			});

			var transcriptQuery = "SELECT * FROM HS_TRANSCRIPT_ANNOT WHERE ensembl_gene_id = '".concat(postedData.gene).concat("';");
			var transResult = await dbCredentials.query(transcriptQuery);

			var t_arr_count = 0;
			var t_arr = {};

			transResult.rows.forEach(row => {
				var cur_transcript = row["ensembl_transcript_id"];
				t_arr[cur_transcript] = [];
			    t_arr[cur_transcript][t_arr[cur_transcript].length] = row["exon_start__bp_"];
			    blob_arr["trans"][blob_arr_tr_count] = row;
			    blob_arr_tr_count = blob_arr_tr_count + 1;				
			});

			var juncQuery = "SELECT * FROM HS_JUNC WHERE gene = '".concat(postedData.gene).concat("';");
			var juncResult = await dbCredentials.query(juncQuery);

			var j_arr_count = 0;
			var j_arr = [];

			juncResult.rows.forEach(row => {
				j_arr[j_arr_count] = {};
			    j_arr[j_arr_count]["junction"] = row["exon_id"];
			    j_arr[j_arr_count]["ensembl_exon_id"] = row["ens_exon_ids"];
			    j_arr[j_arr_count]["start"] = row["exon_region_start_s_"];
			    j_arr[j_arr_count]["stop"] = row["exon_region_stop_s_"];
			    j_arr[j_arr_count]["strand"] = row["strand"];
			    blob_arr["junc"][blob_arr_j_count] = row;
			    blob_arr_j_count = blob_arr_j_count + 1;
			    j_arr_count = j_arr_count + 1;
			});

			outputObject["gene"] = m_arr;
			outputObject["trans"] = t_arr;
			outputObject["junc"] = j_arr;
			outputObject["blob"] = blob_arr;

			res.send(outputObject);
		}
		catch(error){
			res.send(error);
			return next(error);
		}
	}

}

module.exports.exon = exon;