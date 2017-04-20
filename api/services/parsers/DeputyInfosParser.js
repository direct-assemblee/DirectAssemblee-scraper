var DateHelper = require('../helpers/DateHelper.js');
var htmlparser = require('htmlparser2');

var deputyParser = function(callback) {
  var parsedItem = {};
  var expectedItem;
  var expectJobTextCount = 0;

  return new htmlparser.Parser({
    onopentag: function(tagname, attribs) {
      if (attribs.class === "tel") {
        expectedItem = "phone";
      } else if (attribs.class === "email") {
        parsedItem.email = attribs.href.replace("mailto:", '')
      } else if (attribs.href && attribs.href.startsWith("http://www.hatvp.fr")) {
        parsedItem.declarationsUrl = attribs.href;
      } else if (tagname === "dt") {
        expectedItem = "job";
      }
    },
    ontext: function(text) {
      if (expectedItem === "phone") {
        expectedItem = "phoneValue"
      } else if (expectedItem === "phoneValue") {
        parsedItem.phone = text.replace(/\s+/g, '');
        expectedItem = null;
      } else if (expectedItem === "job") {
        if (text === "Biographie") {
          expectJobTextCount = expectJobTextCount + 1;
        } else if (expectJobTextCount > 0) {
          var trimmed = text.trim();
          if (trimmed) {
            expectJobTextCount = expectJobTextCount + 1;
            if (expectJobTextCount === 3) {
              parsedItem.job = trimmed;
              expectedItem = null;
              expectJobTextCount = 0;
            }
          }
        }
      }
    },
    onclosetag: function(tagname) {
      if (tagname === "ul") {
        expectedItem = null;
        expectJobTextCount = 0;
      } else if (tagname == "html") {
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
