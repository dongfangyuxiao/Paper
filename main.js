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
    // let features = [];
    // let target = [];

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


function startExtract() {
  extractSamples();
  extractMalwares();
}

// 1. 定义样本路径
let samplePath = path.resolve('./Samples');

// 2. 定义输出文件路径
let outputPath = path.resolve('./output/result.csv');

/**
 * 启动提取模块
 * @param samplePath
 * @param outputPath
 * @param type (option)样本类型,用于单个样本提取特征
 */
function startExtractionModule(samplePath, outputPath, type) {
  // 失败样本数量
  let error = 0;
  // 启动时间
  let start = +new Date();
  // 总消耗时间
  let totalTime;

  // 确定路径文件夹是否存在,不存在则创建文件夹
  let outputDir = path.dirname(outputPath);
  !fs.existsSync(outputDir) && fs.mkdirSync(outputDir);

  // 初始化输出csv文件头
  initOutputHeader(outputPath);

  // 判断samplePath是文件还是文件夹
  let info = fs.statSync(path.resolve(samplePath));
  if (info.isFile()) {
    // 解析样本文件
    let sampleResult = extractSingleSample(samplePath);
    // 返回多个样本集
    if (Array.isArray(sampleResult) && sampleResult.length > 0) {

    } else {
      // 如果没有传入type
      if (arguments.length === 2) {
        writeSample(sampleResult, outputPath, 1);
      } else {
        writeSample(sampleResult, outputPath, type);
      }
    }

  } else {
    // 开始读取样本文件夹,并提取样本特征
    extractFeature(samplePath);
  }
}


function initOutputHeader(outputPath) {
  // 添加表头
  fs.writeFile(outputPath, 'Entropy,LongestWord,SpecialCh,TotalLines,AverageChPerLine,ASTDepth,FunWithRisk,HTMLRisk,Result\n', function (err) {
    if (err) {
      console.log(err);
    }
  });
}

/**
 * 读取并提取单个文件的特征
 * @param filePath
 */
function extractSingleSample(filePath) {
  // 文件名
  let fileName = path.basename(filePath);
  // 开始读取文件
  fs.readFile(filePath, function (err, fileText) {
    if (err) {
      console.log(err);
      return;
    }

    // 如果文件不是.html文件
    if (fileName.indexOf('.html') === -1) {
      // 单个文件特征集合
      return extractFeature(fileText, fileName);
      // 写入文件
      // writeSample(sampleFeature, 'result.csv');
    } else {
      let scripts = htmlModule.extractCode(fileText);
      let sampleFeatures = [];

      if (scripts.length > 0) {
        for (let i = scripts.length; i--;) {
          sampleFeatures.push(extractFeature(scripts[i], fileName, fileDir));

          return sampleFeatures;
          // 写入文件
          // writeSample(sampleFeature, 'result.csv');
        }
      } else {
        return sampleFeatures;
      }
    }
  });
}

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
 * @param type 样本类型,0或1,1为黑样本
 * @param outPutPath 写入文件目录名称
 */
function writeSample(sampleFeature, outPutPath, type) {
  // 如果所有特征提取正常才写入文件
  if (sampleFeature.length === 7) {
    // 向features中加入样本特征
    /// features.push(sampleFeature);
    console.log('正在写入样本特征...');
    fs.writeFileSync('result.csv', sampleFeature, {flag: 'a'});

    // 良性的样本集
    if (type === 0) {
      // 目标为0，即良性
      /// target.push(0);
      console.log('正在写入样本分类...');
      fs.writeFileSync(outPutPath, ',0' + '\n', {flag: 'a'});
    } else {
      /// target.push(1);
      console.log('正在写入样本分类...');
      fs.writeFileSync(outPutPath, ',1' + '\n', {flag: 'a'});
    }
  } else {
    error++;
    console.log('失败样本数量:' + error);
  }

  // 计算执行时间
  let totalTime = (+new Date()) - start;
  console.log('累计用时: ' + totalTime + 'ms');
}