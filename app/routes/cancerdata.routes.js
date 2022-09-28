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
    router.post("/signaturedata", getSignatureData);
    router.post("/updatesignatures", newSignature);
    router.post("/matchedcoordinates", matchCoordinatesPreSubmission);
    router.post("/genes", matchGenesPreSubmission);
    router.post("/heatmapdata",heatmapData);
    router.post("/singleuiddata", getSingleUidData);
    router.post("/interactivefilter", getInteractiveFilter);
    router.post("/gtexdata", getGtexData);
    router.post("/cbiocurlcommand", cbioportalCurlCommand);
    router.post("/exonviewerdata", getExonViewerData);
    router.post("/translatecbio", cbioportalStudyTranslate);
    router.post("/defaultquery", defaultQuery);
    app.use('/api/datasets', router);

};