var fs = require('fs');
var esprima = require('esprima');

fs.readFile('../mySample/ASTHierarchical', function (err, data) {
  if (err) {
    return console.log(err);
  }

  var result = esprima.parseScript(data.toString().trim(), {tokens: true, comments: true});
  console.log(JSON.stringify(result));
  console.log(result.comment);
});