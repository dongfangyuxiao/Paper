/**
 * @file 计算文本信息熵
 * @author Lijingtao
 * 6/25/18.
 */
const fs = require('fs');
const path = require('path');

// 将./Samples解析为绝对路径
let samplePath = path.resolve('../Samples');

fs.readdir(samplePath, function (err, files) {
  if (err) {
    console.log(err);
  }
  console.log(files);
});


// 计算文本的熵
function calEntropy(text) {
  let map = new Map();

  if (typeof text !== 'string') {
    console.error('传入text不为字符串');
  } else {
    let len = text.length;
    let textArr = text.split('');
    let entropy = 0;

    for (let i = len; i--;) {
      let ch = textArr[i];

      // 如果有此字符则+1
      if (map.has(ch)) {
        map.set(ch, map.get(ch) + 1);
      } else {
        map.set(ch, 1);
      }
    }

    // 计算熵
    for (let value of map.values()) {
      // 字符出现概率
      let p = value / len;
      entropy += p * Math.log10(p);
    }
    return -entropy;
  }
}