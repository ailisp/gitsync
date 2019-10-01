var fs = require("fs"),
  _ = require("lodash"),
  crypto = require("crypto"),
  { q, makeInit, makeMirrorPr, makeMirrorTag, makeMirrorBranch } = require("../queue");

q.push(makeInit())

var getRefName = (ref) => ref.substring(_.indexOf(ref, "/", _.indexOf(ref, "/") + 1) + 1)

module.exports = require("express").Router().post("/", function (req, res) {
  var sig = req.get("x-hub-signature"),
    hmac = crypto.createHmac(sig.split("=")[0], process.env.GITHUB_WEBHOOK_SECRET)

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
    } else if (refSplit[1] === "heads") {
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


