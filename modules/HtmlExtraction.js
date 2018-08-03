/**
 * @file html文件脚本提取及特征处理
 * @author Lijingtao
 * 7/4/18.
 */
const fs = require('fs');
const htmlparser = require('htmlparser2');
const path = require('path');

/**
 * 从html中提取js脚本进行分析
 * @param text
 */
function extractCode(text) {
  let pattern = /<script.*?>([\d\D]*?)<\/script>/img;
  let extractScripts = [];
  // 总包含的脚本数量
  let totalNum = 0;
  while ((result = pattern.exec(text)) != null) {
    totalNum++;
    // 使用exec(),得到的正则匹配中[1]即为第一个分组中的内容,即不带标签的js脚本
    let script = result[1];
    script.length !== 0 && extractScripts.push(script);
  }

  // 返回所有得到的脚本
  return {extractScripts: extractScripts, totalNum: totalNum};
}

/**
 * 提取html中的危险特征
 * @param text
 */
function extractRiskKeyword(text) {

  // 1. html标签中属性内嵌的危险文本keyword
  let riskKeywordSet = new Set(['javascript:', 'eval', 'document', 'url=', 'url(', 'onload', 'fromCharCode']);
  // 2. 危险标签的使用, 注意大小写
  let riskTagSet = new Set(['embed', 'object', 'iframe']);
  // 3. 危险属性的使用, 注意大小写
  let riskAttrSet = new Set(['onerror', 'onmouseover', 'onload']);
  // 危险特征点总数
  let riskNum = 0;

  let parser = new htmlparser.Parser({
    onopentag: function (name, attribs) {
      // 危险标签
      riskTagSet.has(name) && riskNum++;

      if (attribs.length !== 0) {
        for (let attr in attribs) {
          if (attribs.hasOwnProperty(attr)) {
            // 危险属性
            riskAttrSet.has(attr) && riskNum++;
            // 危险文本
            let attrText = attribs[attr];
            riskKeywordSet.has(attrText) && riskNum++;
          }
        }
      }

    },
    ontext: function (text) {
    },
    onclosetag: function (tagname) {
    },
  }, {decodeEntities: true});

  try {
    parser.write(text);
    parser.end();

    // console.log(riskNum);
    return riskNum;
  } catch (e) {
    console.error(e);
    return null;
  }
}

function extractTest() {
  fs.readFile('../S/test/mySample01.html', function (err, text) {
    extractRiskKeyword(text.toString());
  });
}

module.exports.extractCode = extractCode;
module.exports.extractRiskKeyword = extractRiskKeyword;
