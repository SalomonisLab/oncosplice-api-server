const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function exon(req, res, next){
	if (req.method == 'POST') {
		try{
			var outputObject = {};
			var postedData = req.body.data;

			var exonQuery = "SELECT * FROM HS_EXON WHERE gene = '" . postedData.gene . "';";
			var exonResult = await dbCredentials.query(exonQuery);

			var blob_arr_gm_count = 0;
			var blob_arr_tr_count = 0;
			var blob_arr_j_count = 0;
			var blob_arr = [];

			var m_arr_count = 0;
			var m_arr = [];

			exonResult.rows.forEach(row => {
			    $m_arr[$m_arr_count]["exon_name"] = $mrow["exon_id"];
			    $m_arr[$m_arr_count]["start"] = $mrow["exon_region_start_s_"];
			    $m_arr[$m_arr_count]["stop"] = $mrow["exon_region_stop_s_"];
			    $m_arr[$m_arr_count]["splice_junctions"] = $mrow["splice_junctions"];
			    $m_arr[$m_arr_count]["ensembl_exon_id"] = $mrow["ens_exon_ids"];
			    $blob_arr["genemodel"][$blob_arr_gm_count] = $mrow;
			    $m_arr_count = $m_arr_count + 1;
			    $blob_arr_gm_count = $blob_arr_gm_count + 1;
			})

			$transcriptquery = "SELECT * FROM HS_TRANSCRIPT_ANNOT WHERE ensembl_gene_id = '" . $postExRetrieve . "';";
			$transresult = $conn->query($transcriptquery);
			if (!$transresult) {
			    echo "An error occurred2.\n";
			    exit;
			}

			$t_arr_count = 0;
			$t_arr = array();



			while ($mrow = $transresult->fetch(PDO::FETCH_ASSOC)) {
			    $cur_transcript = $mrow["ensembl_transcript_id"];
			    $t_arr[$cur_transcript][count($t_arr[$cur_transcript])] = $mrow["exon_start__bp_"];
			    $blob_arr["trans"][$blob_arr_tr_count] = $mrow;
			    $blob_arr_tr_count = $blob_arr_tr_count + 1;

			    //$t_arr_count = $t_arr_count + 1;
			}

			$juncquery = "SELECT * FROM HS_JUNC WHERE gene = '" . $postExRetrieve . "';";
			$juncresult = $conn->query($juncquery);
			if (!$juncresult) {
			    echo "An error occurred3.\n";
			    exit;
			}

			$j_arr_count = 0;
			$j_arr = array();

			while ($mrow = $juncresult->fetch(PDO::FETCH_ASSOC)) {
			    $j_arr[$j_arr_count]["junction"] = $mrow["exon_id"];
			    $j_arr[$j_arr_count]["ensembl_exon_id"] = $mrow["ens_exon_ids"];
			    $j_arr[$j_arr_count]["start"] = $mrow["exon_region_start_s_"];
			    $j_arr[$j_arr_count]["stop"] = $mrow["exon_region_stop_s_"];
			    $j_arr[$j_arr_count]["strand"] = $mrow["strand"];
			    $blob_arr["junc"][$blob_arr_j_count] = $mrow;
			    $blob_arr_j_count = $blob_arr_j_count + 1;
			    $j_arr_count = $j_arr_count + 1;
			}


			$o_arr = array();
			$o_arr["gene"] = $m_arr;
			$o_arr["trans"] = $t_arr;
			$o_arr["junc"] = $j_arr;
			$o_arr["blob"] = $blob_arr;

			res.send(outputObject);
		}
		catch(error){
			res.send(error);
			return next(error);
		}
	}

}

module.exports.exon = exon;