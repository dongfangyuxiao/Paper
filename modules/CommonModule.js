/**
 * @file 通用功能模块
 * @author Lijingtao
 * 7/17/18.
 */
const esprima = require('esprima');
const fs = require('fs');

/**
 * 根据文本解析得到AST对象
 * @param text
 * @param fileName
 * @returns AST对象
 */
function initASTObj(text, fileName) {
  let ASTObj;
  try {
    ASTObj = esprima.parseScript(text.trim(), {range: false, loc: false, comment: true});
  } catch (e) {
    console.error('AST parse error. File: ' + fileName);
    // 失败样本写入文件记录
    fs.writeFile('./error/ErrorSample.txt', fileName + '\n', {flag: 'a'});
    return null;
  }
  return ASTObj;
}

exports.initASTObj = initASTObj;