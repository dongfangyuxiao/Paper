const estraverse = require('estraverse');

const fs = require('fs');
const esprima = require('esprima');
const escodegen = require('escodegen');

let Dictionary = new Map();

// 异步读取
fs.readFile('./test.js', function (err, data) {
  if (err) {
    return console.log(err);
  }

  var result = esprima.parseScript(data.toString().trim(), {range: false, loc: false});
  console.log(JSON.stringify(result));

  estraverse.traverse(result, {
    enter: function (node, parent) {
      if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration')
        return estraverse.VisitorOption.Skip;
    },
    leave: function (node, parent) {
      if (node.type === 'VariableDeclarator') {
        let name = node.id.name;
        let value = {};
        // console.log(name);
        // console.log(node);
        console.log(escodegen.generate(node));
        let evalStr = 'value.' + escodegen.generate(node);
        console.log(evalStr);
        eval(evalStr);
        Dictionary.set(name, value[name]);
      }
    },
  });

  console.log(Dictionary.size);
});


