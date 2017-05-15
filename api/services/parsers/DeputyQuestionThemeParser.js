var DateHelper = require('../helpers/DateHelper.js');
var htmlparser = require('htmlparser2');

const SECTION_PREFIX = "content-wrap-"

var questionParser = function(callback) {
  var expectRubrique;
  var expectRubriqueValue;

  return new htmlparser.Parser({
    onopentag: function(tagname, attribs) {
      if (attribs.class === "question_col33") {
        expectRubrique = true;
      }
    },
    ontext: function(text) {
      if (expectRubrique && text.startsWith("Rubrique")) {
        expectRubriqueValue = true;
      } else if (expectRubriqueValue) {
        callback(text);
      }
    },
    onclosetag: function(tagname) {

    }
  }, {decodeEntities: true});
}

module.exports = {
  parse: function(content) {
    return new Promise(function(resolve, reject) {
      var parser = questionParser(function(theme) {
        resolve(theme);
      });
      parser.write(content);
      parser.end();
    })
  }
}
