var DateHelper = require('../helpers/DateHelper.js');
var htmlparser = require('htmlparser2');

var deputeParser = function(callback) {
  var parsedItem = {};
  var parsedPropositions = [];
  var currentProp = {};
  var expectedItem;
  var expectedSection;

  return new htmlparser.Parser({
    onopentag: function(tagname, attribs) {
      if (attribs.class === "tel") {
        expectedItem = "phone";
      } else if (attribs.class === "email") {
        parsedItem.email = attribs.href.replace("mailto:", '')
      } else if (attribs.id && attribs.id.startsWith("content-wrap-")) {
        expectedSection = attribs.id.split("content-wrap-")[1];
      } else if (expectedSection === "propositionsloi") {
        if (tagname === "h4") {
          currentProp = {}
          expectedItem = "prop.id";
        } else if (currentProp) {
          if (attribs.href) {
            currentProp.url = attribs.href;
          } else if (tagname === "p") {
            expectedItem = "prop.description";
          }
        }
      }
    },
    ontext: function(text) {
      if (expectedItem === "phone") {
        expectedItem = "phoneValue"
      } else if (expectedItem === "phoneValue") {
        parsedItem.phone = text.replace(/\s+/g, '');
        expectedItem = null;
      } else if (expectedSection === "propositionsloi") {
        if (expectedItem === "prop.id") {
          var splitText = text.split(" ");
          currentProp.id = splitText[splitText.length - 1];
          expectedItem = "prop.date";
        } else if (expectedItem === "prop.date") {
          var text = text.trim();
          if (text) {
            currentProp.date = text;
            expectedItem = null;
          }
        } else if (expectedItem === "prop.description") {
          var text = text.trim();
          if (text) {
            currentProp.description = text;
            parsedPropositions.push(currentProp);
            expectedItem = null;
            currentProp = null;
          }
        }
      }
    },
    onclosetag: function(tagname) {
      if (tagname == "html") {
        parsedItem.propositions = parsedPropositions
        print(parsedItem);
        callback(parsedItem);
      }
    }
  }, {decodeEntities: true});
}

module.exports = {
  parse: function(content) {
    return new Promise(function(resolve, reject) {
      var parser = deputeParser(function(depute) {
        resolve(depute);
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
  console.log(parsedItem.propositions);
  console.log("------------- ");
}
