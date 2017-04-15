// http://www2.assemblee-nationale.fr/deputes/liste/departements/(vue)/tableau

var htmlparser = require('htmlparser2');

var deputeParser = function(callback) {
  var resultItems = [];
  var parsedItem = {};

  var expectedData;

  return new htmlparser.Parser({
    onopentag: function(tagname, attribs) {
      if (tagname === "td" && attribs.class === "denom") {
        expectedData = "id";
      } else if (expectedData === "scrutinUrl") {
        parsedItem.scrutinUrl = attribs.href;
        expectedData = "analysisUrl";
      } else if (expectedData === "analysisUrl") {
        parsedItem.analysisUrl = attribs.href;
        expectedData = null;
      }
    },
    ontext: function(text) {
      if (expectedData === "id") {
        if (text.endsWith('*')) {
          parsedItem.type = "solennel";
        } else {
          parsedItem.type = "normal";
        }
        parsedItem.id = text.replace('*', '');
        expectedData = "date";
      } else if (expectedData === "date") {
        if (text.trim()) {
          parsedItem.date = text;
          expectedData = "description";
        }
      } else if (expectedData === "description") {
        if (text.trim()) {
          parsedItem.description = text.replace('[', '').trim();
          expectedData = "scrutinUrl";
        }
      }
    },
    onclosetag: function(tagname) {
      if (tagname == "tr") {
        resultItems.push(parsedItem);
        print(parsedItem)
        parsedItem = {}
      } else if (tagname == "html") {
        callback(resultItems);
      }
    }
  }, {decodeEntities: true});
}

module.exports = {
  parse: function(content) {
    return new Promise(function(resolve, reject) {
      var parser = deputeParser(function(resultItems) {
        resolve(resultItems);
      });
      parser.write(content);
      parser.end();
    })
  }
}



var print = function(parsedItem) {
  console.log("------------- ");
  console.log(parsedItem);
  console.log("------------- ");
}
