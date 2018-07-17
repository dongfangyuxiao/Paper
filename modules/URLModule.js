/**
 * @file 分割URL特征检测模块
 * @author Lijingtao
 * 7/17/18.
 */
const common = require('./CommonModule');
const estraverse = require('estraverse');
const escodegen = require('escodegen');
const fs = require('fs');

// 字典对象
let Dictionary = new Map();

/**
 * 1. 先存储所有简单变量到字典中
 * 根据Js文本解析,遍历语法树,得到变量声明,储存在Dictionary中
 * @param text
 */
function initDictionary(text) {
  let ASTObj = common.initASTObj(text, '');

  estraverse.traverse(ASTObj, {
    enter: function (node, parent) {
      if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration')
        return estraverse.VisitorOption.Skip;
    },
    leave: function (node, parent) {
      if (node.type === 'VariableDeclarator') {
        let name = node.id.name;
        let value = {};
        let evalStr = 'value.' + escodegen.generate(node);
        // 执行抽象语法树的内容,赋值给value
        eval(evalStr);
        Dictionary.set(name, value[name]);
      }
    },
  });

  for (let [key, value] of Dictionary.entries()) {
    console.log(key, value);
  }
}

function testInit() {
  fs.readFile('../STest/test.js', function (err, data) {
    if (err) {
      return console.log(err);
    }

    initDictionary(data.toString());
  });
}
