const { cancerData } = require("../controllers/cancerData");
const { selectedMetaDataUiFields } = require("../controllers/selectedMetaDataUiFields");
const { signatureList } = require("../controllers/signatureList");
const { matchCoordinatesPreSubmission } = require("../controllers/matchCoordinatesPreSubmission");
const { matchGenesPreSubmission } = require("../controllers/matchGenesPreSubmission");
const { newSignature } = require("../controllers/newSignature");
const { heatmapData } = require("../controllers/heatmapData");

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
    /*
    router.post("/", datasets.fetchSingleUID);
    router.post("/", datasets.fetchGTEX);
    router.post("/", datasets.cbioportalCurlCommand);*/
    app.use('/api/datasets', router);

};