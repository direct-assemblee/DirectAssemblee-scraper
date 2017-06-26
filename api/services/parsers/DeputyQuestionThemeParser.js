'use strict';

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
        expectRubrique = null;
        expectRubriqueValue = null;
      }
    },
    onclosetag: function(tagname) {

    }
  }, {decodeEntities: true});
}

module.exports = {
  parse: function(url, content, workType) {
    return new Promise(function(resolve, reject) {
      if (workType === Constants.WORK_TYPE_QUESTIONS) {
        var parser = questionParser(function(theme) {
          resolve(theme);
        });
        parser.write(content);
        parser.end();
      } else if (workType === Constants.WORK_TYPE_REPORTS) {
        resolve();
      }
    })
  }
}
