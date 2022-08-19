const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function signatureList(req, res, next){
	if (req.method == 'POST') {
		try{
			const postedData = req.body.data;
			const cancerType = postedData.cancerType;
			const queryHelperMap = databaseQueryHelper(cancerType);
		//Code to implement	
		/*
		include 'config.php';
		$conn = makePDO();
		$cancertype = $_POST["CANCER"];

		$TABLE_DICT = array();

		$TABLE_DICT[$cancertype]["META"]["COLUMNS"] = $cancertype . "/Columns";
		$TABLE_DICT[$cancertype]["META"]["RANGE"] = $cancertype . "/Range";
		$TABLE_DICT[$cancertype]["SIG"]["QUERY"] = "SELECT * FROM " . $cancertype . "_TCGA_SIGNATURE";
		$TABLE_DICT[$cancertype]["SIG"]["COLUMNS"] = $cancertype . "/oncofields.txt";
		$TABLE_DICT[$cancertype]["SPLC"]["QUERY"] = "SELECT * FROM " . $cancertype . "_TCGA_SPLICE";
		$TABLE_DICT[$cancertype]["SPLC"]["ROWNUM"] = 999;
		$TABLE_DICT[$cancertype]["SPLC"]["COLNUM"] = 999;
		$TABLE_DICT[$cancertype]["SPLC"]["EXT"] = "";

		$single_base_query = $TABLE_DICT[$cancertype]["SIG"]["QUERY"] . " WHERE";
		$meta_base_query = $TABLE_DICT[$cancertype]["SIG"]["QUERY"] . " WHERE";
		$meta_base_count = 0;
		foreach ($_POST as $key => $value) {
			if($key != "CANCER")
			{
				if("SEL" == substr($key, 0, 3))
				{
					$key = substr($key, 3);
					$key = str_replace("+", "_", $key);
					$single_base_query = $single_base_query." ".$key." = '1'";
				}
				else
				{
					if($meta_base_count != 0)
					{
						$key = str_replace("+", "_", $key);
				    	$meta_base_query = $meta_base_query." OR ".$key." = '1'";
					}
					else
					{
						$key = str_replace("+", "_", $key);
						$meta_base_query = $meta_base_query." ".$key." = '1'";
					}
				    $meta_base_count = $meta_base_count + 1;
				}
			}
		}
		$metaresult = $conn->query($meta_base_query);

		$metanumrows = $metaresult->rowCount();
		if($metanumrows != 0 && $metanumrows != undefined)
		{
			$metanumrows = $metanumrows - 1;
		}

		$singleresult = $conn->query($single_base_query);
		if (!$singleresult) {
		    echo "An error occurred2.\n";
		    exit;
		}

		$singlearray = array();
		$singlecount = 0;
		while ($row = $singleresult->fetch(PDO::FETCH_ASSOC)) {
			$singlearray[$singlecount] = $row["uid"];
			$singlecount = $singlecount + 1;
		}

		$singlenumrows = $singleresult->rowCount();
		if($singlenumrows != 0 && $singlenumrows != undefined)
		{
			$singlenumrows = $singlenumrows - 1;
		}
		$tumrows = array();

		$tumrows["single"] = $singlenumrows;
		$tumrows["singlequery"] = $single_base_query;
		$tumrows["meta"] = $metanumrows;
		$tumrows["metaquery"] = $meta_base_query;
		$tumrows["result"] = $singlearray;

		echo json_encode($tumrows);
		*/
		}
		catch(error){
			res.send(error);
			return next(error);
		}
	}
}

module.exports.signatureList = signatureList;