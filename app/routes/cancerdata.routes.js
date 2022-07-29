const { uiFields } = require("../controllers/uiFields");

module.exports = app => {
    //const datasets = require("../controllers/cancerdata.controller.js");

    var router = require("express").Router();

    // Retrieve all Datasets
    //router.get("/", datasets.testQuery);

    router.post("/", uiFields);
    /*

    router.post("/", datasets.getSignatureList);

    router.post("/", datasets.getSelectedMetaDataUiFields);

    router.post("/", datasets.matchCoordinatesPreSubmission);

    router.post("/", datasets.matchGenesPreSubmission);

    router.post("/", datasets.fetchHeatmapData);

    router.post("/", datasets.fetchSingleUID);

    router.post("/", datasets.fetchGTEX);

    router.post("/", datasets.cbioportalCurlCommand);*/

    app.use('/api/datasets', router);

};