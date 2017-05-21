var DateHelper = require('../helpers/DateHelper.js');
var htmlparser = require('htmlparser2');

var deputyParser = function(url, callback) {
  var parsedItems = [];
  var currentSectionItem;
  var expectedItem;
  var expectedSection;

  return new htmlparser.Parser({
    onopentag: function(tagname, attribs) {
      if (tagname === "h4") {
        currentSectionItem = {}
        expectedItem = "section.id";
      } else if (currentSectionItem) {
        if (attribs.href) {
          currentSectionItem.url = attribs.href;
          expectedSection = "description";
        } else if (expectedSection === "description" && (tagname === "p" || tagname === "li")) {
          if (!attribs.class) {
            expectedItem = "section.description";
          }
        }
      }
    },
    ontext: function(text) {
      if (currentSectionItem) {
        if (expectedItem === "section.id") {
          var trimmed = text.trim();
          if (trimmed) {
            currentSectionItem.title = trimmed;
            var splitText = trimmed.split(" ");
            var index = splitText.indexOf("n°") + 1;
            currentSectionItem.id = splitText[index];
            expectedItem = "section.date";
          }
        } else if (expectedItem === "section.date") {
          var text = text.replace("Publiée le", '').trim();
          if (text) {
            currentSectionItem.date = text;
            expectedItem = null;
          }
        } else if (expectedItem === "section.description") {
          var text = text.trim();
          if (text) {
            currentSectionItem.description = text;
            if (currentSectionItem.title) {
              parsedItems.push(currentSectionItem);
            }
            expectedItem = null;
            expectedSection = null;
            currentSectionItem = null;
          }
        }
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
  parse: function(content, url) {
    return new Promise(function(resolve, reject) {
      var parser = deputyParser(url, function(works) {
        resolve(works);
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
