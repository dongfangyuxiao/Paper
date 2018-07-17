var fs = require('fs');
var esprima = require('esprima');

fs.readFile('./test.js', function (err, data) {
  if (err) {
    return console.log(err);
  }

  var result = esprima.tokenize(data.toString().trim());
  console.log(JSON.stringify(result));
});