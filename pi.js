var cluster = require('cluster');
var fs = require('fs');
var args = require('./args.js').parseArgs();
var math = require('mathjs').create({ number: 'bignumber', precision: 1000 });

var startms = + new Date();
var next = 0;
var workers = {};
var result = 0;
var m1 = math.eval('sqrt(8) / 99^2');

cluster.setupMaster({ exec: 'worker.js' });

function log(logString, force) {
    if (!args.quiet || force) {
        console.log(logString);
    }
}

function spawnInitial() {
    var i;

    for (i = 0; i < args.threads; i++) {
        spawn();
    }
}

function spawn(n) {
    var worker;

    if (n != undefined) {
        //  If 'n' is passed explicitly - use that
        //  This only happens when a worker has errored and work on 'n' needs to be restarted
        log('Spawning ' + n);
        worker = cluster.fork({ n: n });
        onWorkerSpawn(worker, n);
    } else if (next < args.precision) {
        //  If there is more work to do, spawn next worker
        log('Spawning ' + next);
        worker = cluster.fork({ n: next });
        onWorkerSpawn(worker, next);
        next++;
    } else if (!Object.keys(workers).length) {
        //  Nobody's working and there's no more work to do
        done();
    }
}

function onWorkerSpawn(worker, n) {
    workers[worker.id] = n;
    worker.on('message', onWorkerMessage);
}

function onWorkerMessage(msg) {
    log('Done for n=' + msg.n);
    result = math.eval('r1 + r2', { r1: math.bignumber(result), r2: math.bignumber(msg.result) });
}

function onWorkerDisconnect(worker) {
    var n = workers[worker.id];

    delete workers[worker.id];

    if (!worker.suicide) { // accidental disconnect
        log('n=' + n + ' Failed - restarting');
        spawn(n);
    } else {
        spawn();
    }
}


function done() {
    var pi = math.eval('1 / (m1 * r)', { m1: math.bignumber(m1), r: math.bignumber(result) });
    log(+ new Date() - startms + 'ms', true);
    fs.writeFileSync(args.output, pi.toString());
    process.exit(0);
}

cluster.on('exit', onWorkerDisconnect);

spawnInitial();
