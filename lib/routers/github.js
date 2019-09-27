var fs = require("fs"),
  _ = require("lodash"),
  crypto = require("crypto"),
  { exec } = require("child_process"),
  async = require("async")

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

var makeInit = () => {
  return (cb) => {
    exec("scripts/init_repo.sh", {
      env: {
        DIR: process.env.GIT_WORKING_DIR,
        GIT_SRC_ADDRESS: process.env.GIT_SRC
      }
    }, scriptCb(cb))
  }
}, makeMirrorPr = (prId) => {
  return (cb) => {
    exec("scripts/mirror_pr.sh", {
      env: {
        DIR: process.env.GIT_WORKING_DIR,
        PR_ID: prId,
        GIT_TRG_ADDRESS: process.env.GIT_TRG
      }
    }, scriptCb(cb))
  }
}, makeMirrorTag = (tagName) => {
  return (cb) => {
    exec("scripts/mirror_tag.sh", {
      env: {
        DIR: process.env.GIT_WORKING_DIR,
        TAG_NAME: tagName,
        GIT_TRG_ADDRESS: process.env.GIT_TRG
      }
    }, scriptCb(cb))
  }
}, makeMirrorBranch = (ref, branchName) => {
  return (cb) => {
    exec("scripts/mirror_branch.sh", {
      env: {
        DIR: process.env.GIT_WORKING_DIR,
        REF: ref,
        BRANCH_NAME: branchName,
        GIT_TRG_ADDRESS: process.env.GIT_TRG
      }
    }, scriptCb(cb))
  }
}, makeReportCi = (prId, sha) => {
  return (cb) => {
    exec("scripts/report_ci.sh", {
      env: {
        PR_ID: prId,
        GITHUB_SHA: sha,
        GITLAB_PASSWORD: process.env.GITLAB_PASSWORD,
        GITLAB_PROJECT_ID: process.env.GITLAB_PROJECT_ID,
        GITHUB_REPOSITORY: process.env.GITHUB_REPOSITORY,
        GITHUB_TOKEN: process.env.GITHUB_TOKEN,
        GITLAB_HOSTNAME: process.env.GITLAB_HOSTNAME
      }
    }, scriptCb(cb))
  }
}

q.push(makeInit())

var getRefName = (ref) => ref.substring(_.indexOf(ref, "/", _.indexOf(ref, "/") + 1) + 1)

module.exports = require("express").Router().post("/", function (req, res) {
  var sig = req.get("x-hub-signature"),
    hmac = crypto.createHmac(sig.split("=")[0], process.env.GITHUB_SECRET)

  hmac.update(JSON.stringify(req.body), "utf-8")

  if (hmac.digest("hex") !== sig.split("=")[1]) {
    res.status(403)
    res.send("Invalid signature")
    return
  }

  var event = req.get("X-GitHub-Event")

  if (event === "push") {
    console.log("Push event");

    var ref = req.body.ref,
      refSplit = ref.split("/")

    console.log("ref:", ref);

    var refName = getRefName(ref)

    if (refSplit[1] === "tags") {
      console.log("Pushing a tag:", refName);

      q.push(makeMirrorTag(refName))
    } else if (refSplit[1] === "heads" && _.includes(process.env.MIRROR_BRANCHES, refName)) {
      console.log("Pusing a branch:", refName);

      q.push(makeMirrorBranch(ref, refName))
    }

  } else if (event === "pull_request") {
    var head = req.body.pull_request.head

    console.log("Pull request event");
    console.log("action", req.body.action)
    console.log("PR number", req.body.number);
    console.log("head ref", head.ref);
    console.log("head sha", head.sha);
    console.log("head fork?", head.repo.fork);
    console.log("head clone_url", head.repo.clone_url);

    if (_.includes(["opened", "reopened", "synchronize"], req.body.action)) {
      console.log("SYNC!");

      q.push(makeMirrorPr(req.body.number))
      q.push(makeReportCi(req.body.number, head.sha))
    }
  }

  res.status(200).end()
})


