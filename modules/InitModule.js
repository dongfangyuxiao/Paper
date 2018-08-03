/**
 * @file 启动模块
 * @author Lijingtao
 * 7/6/18.
 */
const fs = require('fs');
const path = require('path');
const featureModule = require('./FeatureExtraction');
const htmlModule = require('./HtmlExtraction');

// 处理样本数量
let count = 0;
// 失败样本数量
let error = 0;
// 启动时间
let start = +new Date();
// 总消耗时间
let totalTime;

/**
 * 启动样本提取
 * @param samplePath
 * @param outputPath
 * @param type (option)样本类型,用于单个样本提取特征
 */
function extract(samplePath, outputPath, type) {

  let extractArg = arguments;
  console.log('开始样本提取...');
  // 确定路径文件夹是否存在,不存在则创建文件夹
  !fs.existsSync(outputPath) && fs.mkdirSync(outputPath);

  // 初始化输出csv文件头
  initOutputFile(outputPath);

  if (Array.isArray(samplePath)) {
    for (let item of samplePath) {
      // 判断samplePath是文件还是文件夹
      let info = fs.statSync(path.resolve(item));

      if (info.isFile()) {
        // 解析样本文件
        extractSingleSample(item).then(
          function (sampleResult) {
            let resultLen = sampleResult.length;
            // 返回多个样本集
            if (Array.isArray(sampleResult) && resultLen > 0) {
              for (let i = resultLen; i--;) {
                // 如果没有传入type
                if (extractArg.length === 2) {
                  writeSample(sampleResult[i], outputPath, 1);
                } else {
                  writeSample(sampleResult[i], outputPath, type);
                }
              }
            } else {
              // 如果没有传入type
              if (arguments.length === 2) {
                writeSample(sampleResult, outputPath, 1);
              } else {
                writeSample(sampleResult, outputPath, type);
              }
            }
          }).catch(
          function (err) {
            console.error(err);
          });
      } else {
        // 开始读取样本文件夹,并提取样本特征
        traverseSampleDir(item, outputPath);
      }
    }
  } else {
    throw new Error('传入path格式错误,请以数组格式传入path');
  }
}

/**
 * 遍历文件夹找到样本文件
 * @param samplePath
 * @param outputPath
 */
function traverseSampleDir(samplePath, outputPath) {
  console.log('开始读取文件夹/文件:' + samplePath);
  fs.readdir(samplePath, function (err, dirs) {
    if (err) {
      console.error(err);
    }

    if (dirs.length > 0) {
      for (let i = dirs.length; i--;) {
        let dirName = dirs[i];
        let dirPath = path.resolve(samplePath, dirName);
        let info = fs.statSync(dirPath);

        // 如果是文件则进行特征提取
        if (info.isFile()) {
          console.log('开始解析文件:' + dirName);
          extractSingleSample(dirPath).then(
            function (sampleResult) {
              // 返回多个样本集
              if (sampleResult.length > 0) {
                for (result of sampleResult) {
                  // 如果是白样本文件夹
                  if (path.dirname(dirPath).indexOf('Benign') !== -1 || path.dirname(dirPath).indexOf('output') !== -1) {
                    writeSample(result, outputPath, 0);
                  } else {
                    writeSample(result, outputPath, 1);
                  }
                }
              }
            }
          ).catch(
            function (err) {
              console.error(err);
            }
          );
        } else {
          traverseSampleDir(dirPath, outputPath);
        }
      }
    }
  })
}

/**
 * 添加输出文件头
 * @param outputPath
 */
function initOutputFile(outputPath) {
  fs.writeFile(path.resolve(outputPath, 'result.csv'), 'Entropy,LongestWord,SpecialCh,TotalLines,AverageChPerLine,ASTDepth,FunWithRisk,HTMLRisk,Result\n', function (err) {
    if (err) {
      console.log(err);
    }
  });

  fs.writeFile(path.resolve(outputPath, 'log.txt'), 'Log:\n', function (err) {
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

  return new Promise(function (resolve, reject) {
    // 开始读取文件
    fs.readFile(filePath, function (err, fileText) {
      if (err) {
        reject(err);
      }

      // 如果文件不是.html文件
      if (fileName.indexOf('.html') === -1) {
        // 单个文件特征集合
        resolve(extractScriptFeature(fileText, fileName));
      } else {
        // 提取HTML样本特征
        resolve(extractHTMLFeature(fileText, fileName));
      }
    });

  });
}

/**
 * 提取js脚本特征
 * @param fileText
 * @param fileName
 */
function extractScriptFeature(fileText, fileName) {

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

  // 因默认是分析纯js脚本,默认HTML相关特征点为0
  sampleFeature.push(0);

  return [sampleFeature];
}

/**
 * 提取HTML样本的特征点,因HTML中可能包含多个js脚本
 * 计算 策略是: 单个脚本HTMl特征数 = 提取整个HTML文件特征点数目/总内嵌脚本数量
 * @param fileText
 * @param fileName
 */
function extractHTMLFeature(fileText, fileName) {
  let extractResult = htmlModule.extractCode(fileText);
  // HTML中内嵌脚本内容
  let scripts = extractResult.extractScripts;
  // HTML中总脚本数量
  let totalNum = extractResult.totalNum;
  // 总的样本分析结果
  let results = [];

  if (scripts.length > 0) {
    for (let i = scripts.length; i--;) {
      let script = scripts[i];
      // 首先分析单个样本的js特征点
      let sampleFeature = extractScriptFeature(script, fileName)[0];
      // 提取html样本特征点
      let htmlFeature = htmlModule.extractRiskKeyword(fileText);
      // 删除默认的0特征,加入html特征的值
      sampleFeature.pop();
      // sampleFeature.push((htmlFeature / totalNum).toFixed(2));
      sampleFeature.push((htmlFeature).toFixed(2));
      // 推入一条结果
      results.push(sampleFeature);
    }
    return results;
  } else {
    // 没有内嵌脚本,返回空数组
    return [];
  }
}

/**
 * 将提取的sample内容写入文件
 * @param sampleFeature
 * @param type 样本类型,0或1,1为黑样本
 * @param outPutPath 写入文件目录名称
 */
function writeSample(sampleFeature, outPutPath, type) {
  let resultFilePath = path.resolve(outPutPath, 'result.csv');

  // 如果所有特征提取正常才写入文件
  if (sampleFeature.length === 8) {
    // console.log('正在写入样本特征...');
    fs.writeFileSync(resultFilePath, sampleFeature, {flag: 'a'});

    // 良性的样本集
    if (type === 0) {
      // 目标为0，即良性
      // console.log('正在写入样本分类...');
      fs.writeFileSync(resultFilePath, ',0' + '\n', {flag: 'a'});
    } else {
      // console.log('正在写入样本分类...');
      fs.writeFileSync(resultFilePath, ',1' + '\n', {flag: 'a'});
    }
  } else {
    error++;
    console.log('失败样本数量:' + error);
  }

  // 计算执行时间
  let totalTime = (+new Date()) - start;
  console.log('累计用时: ' + totalTime + 'ms');
  fs.writeFileSync(path.resolve(outPutPath, 'log.txt'), '累计用时: ' + totalTime + 'ms\n');

  // 计数
  console.log('处理样本总数: ' + count++);
  fs.writeFileSync(path.resolve(outPutPath, 'log.txt'), '处理样本总数: ' + count + '\n', {flag: 'a'});
}

module.exports.extract = extract;