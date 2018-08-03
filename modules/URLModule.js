/**
 * @file 分割URL特征检测模块
 * @author Lijingtao
 * 7/17/18.
 */
const common = require('./CommonModule');
const estraverse = require('estraverse');
const escodegen = require('escodegen');
const fs = require('fs');

const env = 'PRODUCTION';
// 字典对象
let Dictionary = new Map();

/**
 * 1. 先存储所有简单变量到字典中
 * 根据Js文本解析,遍历语法树,得到变量声明,储存在Dictionary中
 * @param text
 * @param env 执行环境
 */
function initDictionary(text) {
  let ASTObj = common.initASTObj(text, '');

  estraverse.traverse(ASTObj, {
    enter: function (node, parent) {
      if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration')
        return estraverse.VisitorOption.Skip;
    },
    leave: function (node, parent) {
      // 如果节点是变量声明, 且是简单变量, 则存入Dictionary
      if (node.type === 'VariableDeclarator' && node.init.type === 'Literal') {
        let name = node.id.name;
        let value = {};
        let evalStr = 'value.' + escodegen.generate(node);
        // 执行抽象语法树的内容,赋值给value
        eval(evalStr);
        // 加入Dictionary中
        Dictionary.set(name, value[name]);
      }
    },
  });

  if (env === 'DEBUG') {
    for (let [key, value] of Dictionary.entries()) {
      console.log(key, value);
    }
  }
}

/**
 * 2. 如果存在 + 二元运算符,则有拼接,得到所有用于拼接的字符,取Dictionary中的内容
 * 提取连接的部分
 * @param text
 */
function extractConnection(text) {
  let ASTObj = common.initASTObj(text, '');
  // 储存所有生成的字符串
  let strMap = new Map();

  estraverse.traverse(ASTObj, {
    enter: function (node, parent) {
      // 如果节点是变量声明, 且使用二元运算符, 则有字符串拼接
      if ((node.type === 'VariableDeclarator' && node.init.type === 'BinaryExpression') ||
        // 或, 如果节点是表达式, 且为赋值表达式, 则可能有字符串拼接
        (node.type === 'ExpressionStatement' && node.expression.type === 'AssignmentExpression')) {
        // 得到此类拼接的变量声明后, 开始对此Node进行遍历
        estraverse.traverse(node.init, {
          enter: function (node, parent) {
            console.log(node);
          }
        })
      }
    },
    leave: function (node, parent) {
    },
  });
}

function testInit() {
  fs.readFile('../STest/test.js', function (err, data) {
    if (err) {
      return console.log(err);
    }

    initDictionary(data.toString());
    extractConnection(data.toString());
  });
}

testInit();