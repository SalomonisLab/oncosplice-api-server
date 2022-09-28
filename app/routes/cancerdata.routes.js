const { getUI } = require("../controllers/getUI");
const { getSelectedSamples } = require("../controllers/getSelectedSamples");
const { getSignatureData } = require("../controllers/getSignatureData");
const { matchCoordinatesPreSubmission } = require("../controllers/matchCoordinatesPreSubmission");
const { matchGenesPreSubmission } = require("../controllers/matchGenesPreSubmission");
const { newSignature } = require("../controllers/newSignature");
const { heatmapData } = require("../controllers/heatmap/heatmapData");
const { getSingleUidData } = require("../controllers/getSingleUidData");
const { getGtexData } = require("../controllers/getGtexData");
const { cbioportalCurlCommand } = require("../controllers/cbioportalCurlCommand");
const { getExonViewerData } = require("../controllers/getExonViewerData");
const { getInteractiveFilter } = require("../controllers/getInteractiveFilter");
const { cbioportalStudyTranslate } = require("../controllers/cbioportalStudyTranslate");
const { defaultQuery } = require("../controllers/defaultQuery");

module.exports = app => {
    //const datasets = require("../controllers/cancerdata.controller.js");

    var router = require("express").Router();

    // Retrieve all Datasets
    //router.get("/", datasets.testQuery);

    router.post("/ui", getUI);
    router.post("/samples", getSelectedSamples);
    router.post("/signatureData", getSignatureData);
    router.post("/updateSignatures", newSignature);
    router.post("/matchedCoordinates", matchCoordinatesPreSubmission);
    router.post("/genes", matchGenesPreSubmission);
    router.post("/heatmapData",heatmapData);
    router.post("/singleUidData", getSingleUidData);
    router.post("/interactiveFilter", getInteractiveFilter);
    router.post("/gtexData", getGtexData);
    router.post("/cbioCurlCommand", cbioportalCurlCommand);
    router.post("/exonViewerData", getExonViewerData);
    router.post("/translatecbio", cbioportalStudyTranslate);
    router.post("/defaultQuery", defaultQuery);
    app.use('/api/datasets', router);

};