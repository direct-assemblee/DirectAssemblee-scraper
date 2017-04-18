var DateHelper = require('../helpers/DateHelper.js');
var htmlparser = require('htmlparser2');

var deputyParser = function(callback) {
  var parsedItem = {};
  var expectedItem;

  return new htmlparser.Parser({
    onopentag: function(tagname, attribs) {
      if (attribs.class === "tel") {
        expectedItem = "phone";
      } else if (attribs.class === "email") {
        parsedItem.email = attribs.href.replace("mailto:", '')
      } else if (attribs.href && attribs.href.startsWith("http://www.hatvp.fr")) {
        parsedItem.declarationsUrl = attribs.href;
      }
    },
    ontext: function(text) {
      if (expectedItem === "phone") {
        expectedItem = "phoneValue"
      } else if (expectedItem === "phoneValue") {
        parsedItem.phone = text.replace(/\s+/g, '');
        expectedItem = null;
      }
    },
    onclosetag: function(tagname) {
      if (tagname == "html") {
        // print(parsedItem);
        callback(parsedItem);
      }
    }
  }, {decodeEntities: true});
}

module.exports = {
  parse: function(content) {
    return new Promise(function(resolve, reject) {
      var parser = deputyParser(function(deputy) {
        resolve(deputy);
      });
      parser.write(content);
      parser.end();
    })
  }
}

var print = function(parsedItem) {
  console.log("------------- ");
  console.log(parsedItem.phone);
  console.log(parsedItem.email);
  console.log(parsedItem.declarationsUrl);
  console.log("------------- ");
}
