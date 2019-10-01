var { q, makeReportCi } = require("../queue");

module.exports = require("express").Router().post("/", function (req, res) {
    var event = req.get("X-Gitlab-Event")
    if (event == "Pipeline Hook") {
        console.log("Gitlab pipeline event")
        var id = req.body.object_attributes.id;
        var sha = req.body.object_attributes.sha;
        var status = req.body.object_attributes.status;
        q.push(makeReportCi(id, sha, status))
    }
    res.status(200).end();
})
