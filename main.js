const path = require('path');
const initModule = require('./modules/InitModule');

// 1. 定义样本路径
let samplePaths = [path.resolve('./Samples'), path.resolve('../javascript-malware-collection')];

// 2. 定义输出文件路径
let outputPath = path.resolve('./output');

initModule.extract(samplePaths, outputPath, 1);
