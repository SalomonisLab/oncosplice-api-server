

			function os_func() {
			    this.execCommand = function(cmd, callback) {
			        exec(cmd, (error, stdout, stderr) => {
			            if (error) {
			                console.error(`exec error: ${error}`);
			                return;
			            }

			            callback(stdout);
			        });
			    }
			}

			var columnNamesInitial;
			var columnClusterIndex;
			var columnClusterReturned;
			var columnNamesFirstReturned;
			var output = {};
			var i = 0;
			var indexList = [];
			var outarr = [];

			var os = new os_func();
			var clusterCommand = "python HC_only_circa_v1.py --i resultboxfile.txt --row_method ward --column_method ward --row_metric cosine --column_metric cosine --normalize True 2>&1 &";
			os.execCommand(clusterCommand, function (returnvalue) {
				var read_stream = fs.createReadStream("resultboxfile-clustered.txt");
				var rl = readline.createInterface({
				    input: read_stream
				});
				var fileLineCount = 0;
				var vertexes_number;
				var edges_number;
				var edges = [];
				rl.on('line', function(line){
					if(fileLineCount == 0)
					{
						line = line.replace("\n", "");
						columnNamesInitial = line.split("\t");
						columnNamesInitial = columnNamesInitial.slice(1);
					}
					else if(fileLineCount == 1)
					{
						line = line.replace("\n", "");
						columnClusterIndex = line.split("\t");
						columnClusterIndex = columnClusterIndex.slice(1);
					}
					else
					{
						line = line.split("\t");
						if(line.length > 1)
						{
							outarr[i] = {};
							returned_result[line[0]] = {};
							outarr[i]["uid"] = line[0];
							outarr[i]["pancanceruid"] = line[0];
							outarr[i]["symbol"] = returned_result[line[0]]["symbol"];
							outarr[i]["description"] = returned_result[line[0]]["description"];
							outarr[i]["examined_junction"] = returned_result[line[0]]["examined_junction"];
							outarr[i]["background_major_junction"] = returned_result[line[0]]["background_major_junction"];
							outarr[i]["altexons"] = returned_result[line[0]]["altexons"];
							outarr[i]["proteinpredictions"] = returned_result[line[0]]["proteinpredictions"];
							outarr[i]["dpsi"] = returned_result[line[0]]["dpsi"];
							outarr[i]["clusterid"] = returned_result[line[0]]["clusterid"];
							outarr[i]["chromosome"] = returned_result[line[0]]["chromosome"];
							outarr[i]["coord1"] = returned_result[line[0]]["coord1"];
							outarr[i]["coord2"] = returned_result[line[0]]["coord2"];
							outarr[i]["coord3"] = returned_result[line[0]]["coord3"];
							outarr[i]["coord4"] = returned_result[line[0]]["coord4"];
							outarr[i]["eventannotation"] = returned_result[line[0]]["eventannotation"];
							for(let k = 0; k < columnNamesInitial.length; k++)
							{
								outarr[i][columnNamesInitial[k]] = line[k+1];
							}
						}
						index_list[i] = line;
						i = i + 1;
					}
				    fileLineCount = fileLineCount + 1;
				})
				.on('end', function(){
				    rl.close();
					outputObject["data"] = outarr;
					res.send(outarr);
				});
			});
