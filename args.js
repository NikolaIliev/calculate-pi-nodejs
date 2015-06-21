var ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser();
var cpus = require('os').cpus().length;
parser.addArgument(['-t'], { nargs: 1, defaultValue: cpus, dest: 'threads',help: 'Number of threads to be used in the calculation of PI' });
parser.addArgument(['-p'], { nargs: 1, defaultValue: 10000, dest: 'precision', help: 'Number of iterations of Ramanujan\'s sum' });
parser.addArgument(['-q'], { nargs: 0, action: 'storeTrue', dest: 'quiet', help: 'Quiet mode' });
parser.addArgument(['-o'], { nargs: 1, defaultValue: 'output.txt', dest: 'output', help: 'Name or path to output file' });

module.exports = parser;
