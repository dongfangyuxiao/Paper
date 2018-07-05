/**
 * @file 特征处理module
 * @author Lijingtao
 * 6/25/18.
 */
const esprima = require('esprima');
const fs = require('fs');

/**
 * 根据文本解析得到AST对象
 * @param text
 * @param fileName
 * @returns {*}
 */
function initASTObj(text, fileName) {
  let ASTObj;
  try {
    ASTObj = esprima.parseScript(text.trim(), {range: false, loc: false, comment: true});
  } catch (e) {
    console.error('AST parse error. File: ' + fileName);
    // 失败样本写入文件记录
    fs.writeFile('./result/ErrorSample2.txt', fileName + '\n', {flag: 'a'});
    return null;
  }
  return ASTObj;
}

/**
 * Feature1 计算文本的熵
 * @param text 文本字符串
 * @returns {number} 文本的熵
 */
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

/**
 * Feature2 最长单词大小
 * @param text 文本字符串
 * @param fileName
 * @returns {number|*} 最长单词长度
 */
function getLongestWord(text, fileName) {
  let astObj = initASTObj(text, fileName);
  if (astObj !== null) {
    // 所有语法单元
    let units = astObj.body;
    // 进行递归处理
    return getLongest(units);
  } else {
    return null;
  }
}

function getLongest(obj) {
  let longest = 0;

  // 获得所有key
  let keys = Object.keys(obj);

  // 遍历属性
  for (let i = keys.length; i--;) {
    let key = keys[i];
    let subObj = obj[key];

    // 如果属性是对象(包括数组)则递归遍历
    if (typeof subObj === 'object') {
      if (subObj !== null && subObj !== undefined) {
        let subLongest = getLongest(subObj);
        longest = Math.max(subLongest, longest);
      }
    }
    // 否则找name属性，得到单词长度
    else if (key === 'name' && typeof subObj === 'string') {
      // console.log(subObj);
      longest = subObj.length > longest ? subObj.length : longest;
    }
  }

  return longest;
}

/**
 * Feature3 特殊字符占比
 * @param text
 * @returns {number}
 */
function specialChProportion(text) {
  // 以标准键盘标点符号为特殊字符
  let dictionary = `~!@#$%^&*()-_=+[]{};:'",<.>/?\\`;
  let set = new Set(dictionary.split(''));
  let len = text.length;
  let specChNum = 0;

  let chArr = text.trim().split('');
  for (let i = chArr.length; i--;) {
    if (set.has(chArr[i])) {
      specChNum++;
    }
  }

  return specChNum / len;
}

// Feature4 代码行数
function totalLines(text) {
  let lines = text.split('\n');
  return lines.length;
}

// Feature5 平均每行字符数
function averageChPerLine(text) {
  let lines = text.split('\n');
  return text.length / lines.length;
}

// Feature6 AST深度
function getASTDepth(text, fileName) {
  let ASTObj = initASTObj(text, fileName);
  return depthCallBack(ASTObj);

  function depthCallBack(ASTObj) {
    // null undefined空节点值，返回深度1
    if (ASTObj === undefined || ASTObj === null) {
      return 1;
    }
    // Object.keys('string')返回'0'，所以要加入判断string类型
    if (Object.keys(ASTObj).length === 0 || typeof ASTObj === 'string') {
      return 1;
    }

    // 不属于以上情况，开始遍历
    let maxDepth = 0;
    let keys = Object.keys(ASTObj);
    let len = keys.length;

    // 递归，树的深度等于1 + 子树最大深度，子树最大深度=1 + ...
    for (let i = len; i--;) {
      let nodeDepth = depthCallBack(ASTObj[keys[i]]);
      maxDepth = Math.max(nodeDepth, maxDepth);
    }

    return 1 + maxDepth;
  }
}


// Feature7 危险函数调用，URL变化次数，URL变化也是使用危险函数调用，所以合并为同一个
// Feature Plus 1 操作DOM,从DOM节点中取文本的RiskAPI
function funWithRisk(text, fileName) {
  let astObj = initASTObj(text, fileName);

  if (astObj === null) {
    return null;
  }

  // 危险函数调用Array
  let riskArr = ['eval', 'setInterval', 'setTimeout', 'replace',
    'assign', 'getUserAgent', 'getAppName', 'getCookie', 'setCookie',
    'write', 'changeAttribute', 'writeln', 'innerHTML', 'insertBefore',
    'replaceChild', 'appendChild', 'charAt', 'charCodeAt', 'fromCharCode',
    'indexOf', 'split', 'location', 'unescape'];
  // 以下为添加DOM交互的特征
  let htmlRiskArr = ['innerText', 'childNodes', 'children', 'URL', 'domain', 'getAttribute',
    'nodeValue', 'appendChild', 'addEventListener', 'attachEvent', 'createElement'];
  // DOM 事件特征
  let eventRiskArr = ['mouseover', 'mouseout', 'mousemove'];

  // 危险的函数调用set
  let riskSet = new Set(riskArr);
  let htmlRiskSet = new Set(htmlRiskArr);
  let eventRiskSet = new Set(eventRiskArr);

  // 所有语法单元
  let units = astObj.body;

  // 进行递归处理
  return getRiskFunction(units);

  // 递归函数
  function getRiskFunction(obj) {
    // 危险函数数量
    let number = 0;

    // 获得所有key
    let keys = Object.keys(obj);

    // 遍历属性
    for (let i = keys.length; i--;) {
      let key = keys[i];
      let subObj = obj[key];

      // 如果属性是对象(包括数组)则递归遍历
      if (typeof subObj === 'object') {
        if (subObj !== null && subObj !== undefined) {
          number += getRiskFunction(subObj);
        }
      }
      // 否则找name属性，得到危险函数调用
      else if (key === 'name' && typeof subObj === 'string') {
        if (riskSet.has(subObj)) {
          // console.log('Risk function name: ' + subObj);
          number++;
        }
        // 所占权重不同,值不同
        if (htmlRiskSet.has(subObj)) {
          number += .7;
        }
        if (eventRiskArr.has(subObj)) {
          number += .4;
        }
      }
    }

    return number;
  }
}

// Feature8 <!-- and //-->风格的注释,会被容错执行
function riskComment(text, fileName) {

}

// Feature9 AST上下文环境特征
function ASTHierarchical(text, fileName) {

}

exports.calEntropy = calEntropy;
exports.getLongestWord = getLongestWord;
exports.specialChProportion = specialChProportion;
exports.totalLines = totalLines;
exports.averageChPerLine = averageChPerLine;
exports.getASTDepth = getASTDepth;
exports.funWithRisk = funWithRisk;