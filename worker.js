var worker = require('cluster').worker;
var math = require('mathjs').create({ number: 'bignumber', precision: 1000 });

//  Uncomment to test failing workers
//if (Math.random() > 0.5) {
//    process.exit(0);
//}

worker.on('message', function (n) {
    var result;

    result = math.eval('((4 * n)! * (1103 + 26390 * n)) / ((4^n * n!)^4 * 99^(4*n))', { n: math.bignumber(n) });

    process.send({
        n: n,
        result: result.toString()
    });
});
