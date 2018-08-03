/**
 * @file 通用功能模块
 * @author Lijingtao
 * 7/17/18.
 */
const esprima = require('esprima');
const fs = require('fs');
const path = require('path');

/**
 * 根据文本解析得到AST对象
 * @param text
 * @param fileName
 * @param errorPath 记录错误样本的文件
 * @returns AST对象
 */
function initASTObj(text, fileName, errorPath) {
  let ASTObj;
  try {
    ASTObj = esprima.parseScript(text.trim(), {range: false, loc: false, comment: true});
  } catch (e) {
    console.error('AST parse error. File: ' + fileName);
    // 失败样本写入文件记录
    fs.writeFile(path.resolve(errorPath, 'ErrorSamples.txt'), fileName + '\n', {flag: 'a'});
    return null;
  }
  return ASTObj;
}

exports.initASTObj = initASTObj;