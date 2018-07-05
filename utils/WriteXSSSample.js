/**
 * @file 读取./Samples/xssSample.log中的内容,分别保存为.html文件
 * @author Lijingtao
 * 7/5/18.
 */
const fs = require('fs');
const path = require('path');

const samplePath = path.resolve('../Samples/xssSamples.log');

fs.readFile(samplePath, function (err, data) {
  if (err) {
    throw new Error(err);
  }

  let text = data.toString();
  let textArr = text.split('VM844:1');
  // 分割字符串,存储
  for (let i = textArr.length; i--;) {
    let fileName = 'sample' + i + '.html';
    fs.writeFile('../Samples/OWASPSamples/' + fileName, textArr[i]);
  }
});