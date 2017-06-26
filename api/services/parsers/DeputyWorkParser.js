'use strict';

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
        if (attribs.href && !currentSectionItem.url) {
          currentSectionItem.url = attribs.href;
          expectedSection = "description";
        } else if (expectedSection === "description" && (tagname === "p" || tagname === "li") && !attribs.class) {
          expectedItem = "section.description";
        }
      }
    },
    ontext: function(text) {
      if (currentSectionItem) {
        if (expectedItem === "section.id") {
          var trimmed = text.trim();
          if (trimmed) {
            currentSectionItem.title = trimmed;
            trimmed = trimmed.replace("-", " ").replace(/\s+/g, ' ');
            var splitText = trimmed.split(" ");
            var index = splitText.indexOf("n°") + 1;
            if (index > 0) {
              currentSectionItem.id = splitText[index];
              // console.log(trimmed + "=> " + currentSectionItem.id)
            }
            expectedItem = "section.date";
          }
        } else if (expectedItem === "section.date") {
          var trimmed = text.trim();
          if (trimmed) {
            var dateMatched = DateHelper.findDateInString(trimmed);
            if (dateMatched) {
              currentSectionItem.date = dateMatched;
              expectedItem = null;
            }
          }
        } else if (expectedItem === "section.description") {
          var text = text.trim();
          if (text) {
            currentSectionItem.description = currentSectionItem.description ? currentSectionItem.description + " - " : "";
            currentSectionItem.description += text;
            if (currentSectionItem.id) { // all but public sessions (more lines <li>)
              expectedSection = null;
              expectedItem = null;
            }
          }
        }
      }
    },
    onclosetag: function(tagname) {
      if (currentSectionItem && (tagname == "ul" || tagname == "div")) {
        if (currentSectionItem.description) {
          parsedItems.push(currentSectionItem);
          expectedItem = null;
          expectedSection = null;
          currentSectionItem = null;
        }
      } else if (tagname == "html") {
        // print(parsedItems);
        callback(parsedItems);
        parsedItems = null;
        expectedItem = null;
        expectedSection = null;
        currentSectionItem = null;
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
