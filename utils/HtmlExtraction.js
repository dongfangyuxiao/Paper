/**
 * @file html文件脚本提取及特征处理
 * @author Lijingtao
 * 7/4/18.
 */
const fs = require('fs');

/**
 * 从html中提取js脚本进行分析
 * @param text
 */
function extractCode (text) {
  let pattern = /<script.*?>([\d\D]*?)<\/script>/img;
  let extractScripts = [];
  while ((result = pattern.exec(text)) != null) {
    // 使用exec(),得到的正则匹配中[1]即为第一个分组中的内容,即不带标签的js脚本
    let script = result[1];
    script.length !== 0 && extractScripts.push(script);
  }

  // 返回所有得到的脚本
  return extractScripts;
}

module.exports.extractCode = extractCode;
