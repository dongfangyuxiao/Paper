const fs = require('fs');

fs.writeFile('./output/input.txt', '[' + [1, 23, 42,3] + ']', function (err) {
  fs.writeFile('input.txt', 'World', {flag: 'a'}, function (err) {

  });
});