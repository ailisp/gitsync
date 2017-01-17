var express = require("express"),
    app = express(),
    fs = require("fs"),
    http = require("http"),
    https = require("https")


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

var port = process.env.PORT || 80,
    sslPort = process.env.SSL_PORT || 443,
    httpServer,
    httpsServer


module.exports = {
  start: function(){
    http.createServer(app).listen(port, (err, server) => {
      console.log("http server listening on", port)

      httpServer = server
    })

    if(process.env.SSL_KEY && process.env.SSL_CERT){
      https.createServer({
        key: fs.readFileSync(process.env.SSL_KEY),
        cert: fs.readFileSync(process.env.SSL_CERT)
      }, app).listen(sslPort, (err, server) => {
        console.log("https server listening on", sslPort)
        httpsServer = server
      });
    }
  },
  stop: function(){
    httpServer.close()
    httpsServer.close()
  }
}
