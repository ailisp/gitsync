var fs = require("fs"),
    _ = require("lodash"),
    crypto = require("crypto"),
    q = require("../queue");

var makeReportCi = (ci_id, sha, status) => {
    return (cb) => {
        exec("scripts/report_ci.sh", {
            env: {
                GITHUB_SHA: sha,
                GITHUB_REPOSITORY: process.env.GITHUB_REPOSITORY,
                GITHUB_TOKEN: process.env.GITHUB_TOKEN,
                PIPELINE_ID: ci_id,
                ci_status: status,
                GITLAB_HOSTNAME: process.env.GITLAB_HOSTNAME,
                GITLAB_REPOSITORY: process.env.GITLAB_REPOSITORY
            }
        }, scriptCb(cb))
    }
}

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
