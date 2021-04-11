// var randomisation = require("./feistel")
// const {performance} = require('perf_hooks')

// var f0 = performance.now()
// var random_val=randomisation.randomisation("c1d2a594f213bf3f64773122f26646a584e46b791e0a52d59242845b7deae241518b44b82f72a99f0714a54d05bb125558ebb74ed223a598684ec9d1050e18a9088b0de90c056195031ae4005212dd27091c3bcf0b7cd4536531ee1f29a5ccc1")
// var f1 = performance.now()
// console.log(random_val) 
// console.log("Time Taken: ",(f1-f0),"ms")
// console.log()
// var t0 = performance.now()
// console.log(randomisation.derandomisation(random_val))
// var t1 = performance.now()
// console.log("Time Taken: ",(t1-t0),"ms")

var childProcess = require('child_process');

function runScript(scriptPath,uuid ,callback) {
    var invoked = false;
    console.log()
    var process = childProcess.fork(scriptPath);
    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        callback(err);
    });
    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        var err = code === 0 ? null : new Error('exit code ' + code);
        callback(err);
    });

}
runScript('./email.js','St.Michaels', function (err) {
    if (err) throw err;
});