var DateHelper = require('../helpers/DateHelper.js');
var htmlparser = require('htmlparser2');
var Constants = require('../Constants.js')

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
        text = text.trim();
        var theme = text.charAt(0).toUpperCase() + text.slice(1);
        callback(theme);
      }
    },
    onclosetag: function(tagname) {

    }
  }, {decodeEntities: true});
}

module.exports = {
  parse: function(url, content, workType) {
    return new Promise(function(resolve, reject) {
      var callback = function(theme) {
        resolve(theme);
      }
      var parser;
      if (workType === Constants.WORK_TYPE_QUESTIONS) {
        parser = questionParser(callback);
      } else if (workType === Constants.WORK_TYPE_REPORTS) {
        resolve();
      }
      if (parser) {
        parser.write(content);
        parser.end();
      }
    })
  }
}
