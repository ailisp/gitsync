var async = require("async")

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

module.exports = { q, scriptCb };