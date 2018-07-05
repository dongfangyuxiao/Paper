/**
 * @file Esprima解析语法树
 * @author Lijingtao
 * 6/25/18.
 */
var fs = require('fs');
var esprima = require('esprima');
var myModule = require('../../utils/FeatureExtraction');

// ./Samples/Attack based on multimedia/83.txt

// 异步读取
fs.readFile('./test.js', function (err, data) {
  if (err) {
    return console.log(err);
  }

  var result = esprima.parseScript(data.toString().trim(), {range: false, loc: false});
  console.log(JSON.stringify(result))
});

// 测试AST深度
/*fs.readFile('./sample2.js', function (err, data) {
  if (err) {
    return console.log(err);
  }

  var result = esprima.parseScript(data.toString().trim(), {range: false, loc: false});
  console.log(JSON.stringify(result));
  console.log(myModule.getASTDepth(result));
});*/


// 测试危险函数调用
// fs.readFile('./Samples/Attack based on multimedia/1084.txt', function (err, data) {
//   if (err) {
//     return console.log(err);
//   }
//
//   var result = esprima.parseScript(data.toString().trim(), {range: false, loc: false});
//   console.log(JSON.stringify(result));
//   console.log(myModule.funWithRisk(result));
// });
