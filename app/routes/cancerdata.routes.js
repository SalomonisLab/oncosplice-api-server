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

module.exports = app => {
    //const datasets = require("../controllers/cancerdata.controller.js");

    var router = require("express").Router();

    // Retrieve all Datasets
    //router.get("/", datasets.testQuery);

    router.post("/getui", getUI);
    router.post("/getsamples", getSelectedSamples);
    router.post("/getsignaturedata", getSignatureData);
    router.post("/updatesignatures", newSignature);
    router.post("/getcoords", matchCoordinatesPreSubmission);
    router.post("/getgenes", matchGenesPreSubmission);
    router.post("/getheatmapdata",heatmapData);
    router.post("/getsingleuid", getSingleUidData);
    router.post("/getinteractivefilter", getInteractiveFilter);
    router.post("/getgtex", getGtexData);
    router.post("/getcbio", cbioportalCurlCommand);
    router.post("/getexonviewerdata", getExonViewerData);
    router.post("/translatecbio", cbioportalStudyTranslate);
    app.use('/api/datasets', router);

};