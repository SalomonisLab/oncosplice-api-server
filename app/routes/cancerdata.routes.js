const { cancerData } = require("../controllers/cancerData");
const { selectedMetaDataUiFields } = require("../controllers/selectedMetaDataUiFields");
const { signatureList } = require("../controllers/signatureList");
const { matchCoordinatesPreSubmission } = require("../controllers/matchCoordinatesPreSubmission");
const { matchGenesPreSubmission } = require("../controllers/matchGenesPreSubmission");
const { newSignature } = require("../controllers/newSignature");
const { heatmapData } = require("../controllers/heatmapData");
const { singleUID } = require("../controllers/singleUID");
const { gtex } = require("../controllers/gtex");
const { cbioportalCurlCommand } = require("../controllers/cbioportalCurlCommand");
const { exon } = require("../controllers/exon");

module.exports = app => {
    //const datasets = require("../controllers/cancerdata.controller.js");

    var router = require("express").Router();

    // Retrieve all Datasets
    //router.get("/", datasets.testQuery);

    router.post("/cancerdata", cancerData);
    router.post("/getmetadata", selectedMetaDataUiFields);
    router.post("/getsignatures", signatureList);
    router.post("/getcoords", matchCoordinatesPreSubmission);
    router.post("/getgenes", matchGenesPreSubmission);
    router.post("/newsignature", newSignature);
    router.post("/getHeatmapData",heatmapData);
    router.post("/getSingleUID", singleUID);
    router.post("/getGTEX", gtex);
    router.post("/getCBIO", cbioportalCurlCommand);
    router.post("/getExon", exon);
    app.use('/api/datasets', router);

};