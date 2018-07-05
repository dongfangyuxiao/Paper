var htmlparser = require('htmlparser2');
var fs = require('fs');


var parser = new htmlparser.Parser({
  onopentag: function (name, attribs) {
    if (name === 'script' && attribs.type === 'text/javascript') {
      console.log('JS! Hooray!');
    }

    for (let attr in attribs) {
      if (attribs.hasOwnProperty(attr)) {
        console.log(attribs[attr]);
      }
    }
  },
  ontext: function (text) {
    console.log('-->', text);
  },
  onclosetag: function (tagname) {
    if (tagname === 'script') {
      console.log('That\'s it?!');
    }
  },
}, {decodeEntities: true});

fs.readFile('../../Samples/OWASPSamples/sample37.html', function (err, data) {
  parser.write(data.toString());
  parser.end();
});

