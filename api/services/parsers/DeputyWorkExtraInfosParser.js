'use strict';

var htmlparser = require('htmlparser2');

var deputyWorkExtraInfosParser = function(callback) {
  var parsedItem = {};
  var expectedItem;

  return new htmlparser.Parser({
    onopentag: function(tagname, attribs) {
      if (tagname === "title") {
        expectedItem = "title";
      } else if (tagname === "meta" && attribs.content) {
        if (attribs.name === "TITRE_DOSSIER") {
          if (attribs.content.indexOf(':') > 0) {
            var splitted = attribs.content.split(':');
            var theme = splitted[0].trim()
            var desc = splitted[1].trim()
            parsedItem.description = desc.charAt(0).toUpperCase() + desc.slice(1);
            if (theme && theme !== "DOSSIER") {
              parsedItem.theme = theme
            }
          } else {
            parsedItem.description = attribs.content;
          }
        } else if (attribs.name === "TITRE") {
          parsedItem.title = parsedItem.title.replace(attribs.content.trim(), '');
        }
      }
    },
    ontext: function(text) {
      if (expectedItem === "title") {
        var trimmed = text.trim();
        if (trimmed && trimmed.length > 0) {
          var separator = trimmed.indexOf("-");
          parsedItem.title = trimmed.substring(separator + 2).trim();
          trimmed = trimmed.replace("-", " ").replace(/\s+/g, ' ');
          var splitText = trimmed.split(" ");
          var index = splitText.indexOf("N°") + 1;
          if (index > 0) {
            parsedItem.id = splitText[index];
          }
        }
        expectedItem = null;
      }
    },
    onclosetag: function(tagname) {
      if (tagname === "head") {
        callback(parsedItem);
        parsedItems = null;
        expectedItem = null;
      }
    }
  }, {decodeEntities: true});
}

module.exports = {
  parse: function(url, content, workType) {
    return new Promise(function(resolve, reject) {
      var parser = deputyWorkExtraInfosParser(function(theme) {
        resolve(theme);
      });
      parser.write(content);
      parser.end();
    })
  }
}
