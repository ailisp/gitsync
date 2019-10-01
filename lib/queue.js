var async = require("async"),
    { exec } = require("child_process");

var q = async.queue((task, cb) => {
    task(cb)
})

q.drain = function () {
    console.log('No new jobs');
};

var scriptCb = (cb) => {
    return (err, stdout, stderr) => {
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);

        cb(err)
    }
}

const ENV = process.env;
const DIR = ENV.GIT_WORKING_DIR + "/" + ENV.REPO;
const GITHUB_REPOSITORY = `${ENV.GITHUB_ORG}/${ENV.REPO}`;
const GITLAB_REPOSITORY = `${ENV.GITLAB_ORG}/${ENV.REPO}`;
const GIT_SRC_ADDRESS = `https://${ENV.GITHUB_USERNAME}:${ENV.GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}`;
const GIT_TRG_ADDRESS = `https://${ENV.GITLAB_USERNAME}:${ENV.GITLAB_TOKEN}@${ENV.GITLAB_HOSTNAME}/${GITLAB_REPOSITORY}`;

var makeInit = () => {
    return (cb) => {
        exec("scripts/init_repo.sh", {
            env: {
                DIR,
                GIT_SRC_ADDRESS
            }
        }, scriptCb(cb))
    }
}, makeMirrorPr = (prId) => {
    return (cb) => {
        exec("scripts/mirror_pr.sh", {
            env: {
                DIR,
                PR_ID: prId,
                GIT_TRG_ADDRESS,
            }
        }, scriptCb(cb))
    }
}, makeMirrorTag = (tagName) => {
    return (cb) => {
        exec("scripts/mirror_tag.sh", {
            env: {
                DIR,
                TAG_NAME: tagName,
                GIT_TRG_ADDRESS,
            }
        }, scriptCb(cb))
    }
}, makeMirrorBranch = (ref, branchName) => {
    return (cb) => {
        exec("scripts/mirror_branch.sh", {
            env: {
                DIR,
                REF: ref,
                BRANCH_NAME: branchName,
                GIT_TRG_ADDRESS,
            }
        }, scriptCb(cb))
    }
}, makeReportCi = (ci_id, sha, status) => {
    return (cb) => {
        exec("scripts/report_ci.sh", {
            env: {
                GITHUB_SHA: sha,
                GITHUB_REPOSITORY,
                GITHUB_TOKEN,
                PIPELINE_ID: ci_id,
                ci_status: status,
                GITLAB_HOSTNAME: ENV.GITLAB_HOSTNAME,
                GITLAB_REPOSITORY,
            }
        }, scriptCb(cb))
    }
}

module.exports = { q, makeInit, makeMirrorPr, makeMirrorTag, makeMirrorBranch, makeReportCi };