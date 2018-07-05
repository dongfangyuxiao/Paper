/**
 * 读取并分析样本特征，其中恶意样本942个，白样本20000个
 * 14276 / 2 = 7138个样本存在分析问题
 */
const fs = require('fs');
const path = require('path');
const featureModule = require('./utils/FeatureExtraction');
const htmlModule = require('./utils/HtmlExtraction');

function extractFeature(samplePath) {
  // 读取文件树
  fs.readdir(samplePath, function (err, files) {
    if (err) {
      console.log(err);
    }
    /*let features = [];
    let target = [];*/

    // 遍历目录
    for (let i = files.length; i--;) {
      let fileDir = files[i];
      console.log('开始提取文件夹: ' + fileDir);

      // 开始读取文件夹
      let fileDirPath = path.resolve(samplePath, fileDir);

      fs.readdir(fileDirPath, function (err, files) {
        console.log('文件夹:' + fileDirPath + '的样本数量为:' + files.length);
        // 开始遍历读取样本文件
        for (let j = files.length; j--;) {

          // 文件名
          let fileName = path.resolve(fileDirPath, files[j]);

          console.log('提取文件: ' + fileName);

          // 开始读取文件
          fs.readFile(fileName, function (err, fileText) {
            if (err) {
              console.log(err);
              return;
            }

            // 如果文件不是.html文件
            if (fileName.indexOf('.html') === -1) {
              // 单个特征
              let sampleFeature = [];
              // 提取特征
              extractFeature(sampleFeature, fileText, fileName);
              // 写入文件
              writeSample(sampleFeature, 'result.csv');
            } else {
              let scripts = htmlModule.extractCode(fileText);

              for (let i = scripts.length; i--;) {
                let sampleFeature = extractFeature(scripts[i], fileName, fileDir);
                // 写入文件
                writeSample(sampleFeature, 'result.csv');
              }
            }
          });
        }
      });
    }
  });

  /**
   * 提取特征
   * @param fileText
   * @param fileName
   */
  function extractFeature(fileText, fileName) {

    let sampleFeature = [];
    fileText = fileText.toString();

    // 提取特征
    let entropy = featureModule.calEntropy(fileText);
    sampleFeature.push(entropy);

    let longestWord = featureModule.getLongestWord(fileText, fileName);
    // AST提取出错则不推入数据
    longestWord !== null && sampleFeature.push(longestWord);

    let proportion = featureModule.specialChProportion(fileText);
    sampleFeature.push(proportion);

    let totalLines = featureModule.totalLines(fileText);
    sampleFeature.push(totalLines);

    let averageChPerLine = featureModule.averageChPerLine(fileText);
    sampleFeature.push(averageChPerLine);

    let depth = featureModule.getASTDepth(fileText, fileName);
    depth !== null && sampleFeature.push(depth);

    let funWithRisk = featureModule.funWithRisk(fileText, fileName);
    funWithRisk !== null && sampleFeature.push(funWithRisk);

    return sampleFeature;
  }

  /**
   * 将提取的sample内容写入文件
   * @param sampleFeature
   * @param fileDir
   * @param outFileName 写入文件目录名称
   */
  function writeSample(sampleFeature, fileDir, outFileName) {
    // 如果所有特征提取正常才写入文件
    if (sampleFeature.length === 7) {
      // 向features中加入样本特征
      /// features.push(sampleFeature);
      console.log('正在写入样本特征...');
      fs.writeFileSync('result.csv', sampleFeature, {flag: 'a'});

      // 良性的样本集
      if (fileDir === 'Benign') {
        // 目标为0，即良性
        /// target.push(0);
        console.log('正在写入样本分类...');
        fs.writeFileSync(outFileName, ',0' + '\n', {flag: 'a'});
      } else {
        /// target.push(1);
        console.log('正在写入样本分类...');
        fs.writeFileSync(outFileName, ',1' + '\n', {flag: 'a'});
      }
    } else {
      error++;
      console.log('失败样本数量:' + error);
    }

    // 计算执行时间
    totalTime = (+ new Date()) - start;
    console.log('累计用时: ' + totalTime + 'ms');
  }
}

function extractSamples() {
  // 将./Samples解析为绝对路径
  let samplePath = path.resolve('./S');
  extractFeature(samplePath);
}

// extractSamples();

function extractMalwares() {
  let MalwarePath = ['1936', '2015', '2016', '2017'];
  for (let i = MalwarePath.length; i--;) {
    let samplePath = path.resolve('../javascript-malware-collection', MalwarePath[i]);
    extractFeature(samplePath);
  }
}

// extractMalwares();

function initOutputHeader() {
  // 添加表头
  fs.writeFile('result.csv', 'Entropy,LongestWord,SpecialCh,TotalLines,AverageChPerLine,ASTDepth,FunWithRisk,Result\n', function (err) {
    if (err) {
      console.log(err);
    }
  });
}

function startExtract() {
  initOutputHeader();
  extractSamples();
  extractMalwares();
}

let error = 0;
let start = + new Date();
let totalTime;

startExtract();