var express = require("express"),
    app = express(),
    http = require("http")


app.use(function(req,res,next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH");
  res.header("Access-Control-Allow-Headers", "Accept, Content-Type, Authorization, "
             + "X-Requested-With");
  
  next();
});



app.use(require("body-parser").json({limit: '50mb'}));

app.get('/', function(req, res) {
  res.json({
    name: "Gitsync",
    status: "OK"
  });
});


app.use("/github", require("./routers/github"))

var port = process.env.PORT || 3000,
    httpServer


module.exports = {
  start: function(){
    http.createServer(app).listen(port, (err, server) => {
      console.log("server listening on", port)

      httpServer = server
    })
  },
  stop: function(){
    httpServer.close()
  }
}
