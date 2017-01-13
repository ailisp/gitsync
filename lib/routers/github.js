var fs = require("fs"),
    crypto = require("crypto"),
    _ = require("lodash")



var repo = require("simple-git")()

repo.addRemote("src", process.env.GIT_SRC)
  .addRemote("trg", process.env.GIT_TRG)


module.exports = require("express").Router().post("/", function(req,res){
  var sig = req.get("x-hub-signature"),
      hmac = crypto.createHmac(sig.split("=")[0], process.env.GITHUB_SECRET)

  hmac.update(JSON.stringify(req.body), "utf-8")

  if(hmac.digest("hex") !== sig.split("=")[1]){
    res.status(403)
    res.send("Invalid signature")
    return 
  }

  if(req.get("X-GitHub-Event") === "push"){
    var branch = _.last(req.body.ref.split("/"))

    repo.pull("src", branch)
      .push("trg", branch)
  }
  
  res.status(200).end()
})
