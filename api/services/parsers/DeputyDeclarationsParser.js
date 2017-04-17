var DateHelper = require('../helpers/DateHelper.js');
var htmlparser = require('htmlparser2');

var declarationsParser = function(callback) {
  var parsedItems = [];
  var expectedItem;
  var currentDecla;

  return new htmlparser.Parser({
    onopentag: function(tagname, attribs) {
      if (attribs.class === "type") {
        expectedItem = "title";
        currentDecla = {};
      } else if (tagname === "time") {
        expectedItem = "date";
      } else if (attribs.class === "button button--6") {
        currentDecla.url = attribs.href;
        parsedItems.push(currentDecla);
      }
    },
    ontext: function(text) {
      if (expectedItem === "title") {
        currentDecla.title = text;
      } else if (expectedItem === "date") {
        currentDecla.date = text;
        expectedItem = null;
      }
    },
    onclosetag: function(tagname) {
      if (tagname == "html") {
        // print(parsedItems);
        callback(parsedItems);
      }
    }
  }, {decodeEntities: true});
}

module.exports = {
  parse: function(content) {
    return new Promise(function(resolve, reject) {
      var parser = declarationsParser(function(declarations) {
        resolve(declarations);
      });
      parser.write(content);
      parser.end();
    })
  }
}

var print = function(parsedItems) {
  console.log("------------- ");
  console.log(parsedItems);
  console.log("------------- ");
}
