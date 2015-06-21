var cluster = require('cluster');
var math = require('mathjs').create({ number: 'bignumber', precision: 100 });
var n = +process.env.n;

//  Uncomment to test failing workers
//if (Math.random() > 0.5) {
//    process.exit(0);
//}

var result = math.eval('((4 * n)! * (1103 + 26390 * n)) / ((4^n * n!)^4 * 99^(4*n))', { n: math.bignumber(n) });

process.send({
    n: n,
    result: result.toString()
});

cluster.worker.disconnect();
