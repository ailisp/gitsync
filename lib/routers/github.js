var fs = require("fs"),
  _ = require("lodash"),
  crypto = require("crypto"),
  { q, scriptCb } = require("../queue"),
  { exec } = require("child_process");

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
      console.log("Pushing a branch:", refName);

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

    if (_.includes(["opened", "reopened", "synchronize"], req.body.action) && head.repo.fork) {
      // Only mirror pr from forks
      console.log("SYNC!");

      q.push(makeMirrorPr(req.body.number))
    }
  }

  res.status(200).end()
})


