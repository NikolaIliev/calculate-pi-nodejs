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
    for (var i = 0; i < Math.min(args.threads, args.precision); i++) {
        spawn();
    }
}

function spawn(n) {
    var worker = cluster.fork();

    workers[worker.id] = { worker: worker };
    worker.on('message', onWorkerMessage.bind(null, worker));

    if (n == undefined) {
        schedule(worker);
    } else {
        reschedule(worker, n);
    }
}

function schedule(worker) {
    if (next <= args.precision) {
        log('Started on ' + next);
        worker.send(next);
        workers[worker.id].n = next;
        next++;
    } else {
        worker.disconnect();
    }
}

function reschedule(worker, n) {
    worker.send(n);
    workers[worker.id].n = n;
}

function onWorkerMessage(worker, msg) {
    log('Done for n=' + msg.n);
    result = math.eval('r1 + r2', { r1: math.bignumber(result), r2: math.bignumber(msg.result) });
    schedule(worker);
}

function onWorkerDisconnect(worker) {
    var n = workers[worker.id].n;

    delete workers[worker.id];

    if (!worker.exitedAfterDisconnect) { // accidental disconnect
        log('n=' + n + ' Failed - restarting');
        spawn(n);
    } else if (!Object.keys(workers).length) {
        done();
    }
}


function done() {
    var pi = math.eval('1 / (m1 * r)', { m1: math.bignumber(m1), r: math.bignumber(result) });
    log(+ new Date() - startms + 'ms', true);
    fs.writeFileSync(args.output, pi.toString());
}

cluster.on('exit', onWorkerDisconnect);

spawnInitial();
