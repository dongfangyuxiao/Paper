const fs = require('fs');
const path = require('path');

// 将./Samples解析为绝对路径
let samplePath = path.resolve('./Samples');

fs.readdir(samplePath, function (err, files) {
  if (err) {
    console.log(err);
  }
  console.log(files);
});
