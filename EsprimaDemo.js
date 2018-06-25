/**
 * @file Esprima解析语法树
 * @author Lijingtao
 * 6/25/18.
 */
var fs = require('fs');
var esprima = require('esprima');

// 异步读取
fs.readFile('./Samples/Benign/0', function (err, data) {
  if (err) {
    return console.log(err);
  }

  var result = esprima.parseScript(data.toString().trim(), {range: false, loc: false});
  console.log(calEntropy(data.toString().trim()))

});
