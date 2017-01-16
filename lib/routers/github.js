var fs = require("fs"),
    crypto = require("crypto"),
    {exec} = require("child_process"),
    async = require("async")

var q = async.queue((task, cb)=>{
  console.log("mirroring repo")
  
  exec("scripts/mirror.sh", { }, (err, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);

    console.log("Finished mirroring")
    cb(err)
  })
})

// assign a callback
q.drain = function() {
  console.log('No new mirroring jobs');
};

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
    q.push({},(err) => {
      if(err) throw err
    })
  }
  
  res.status(200).end()
})


