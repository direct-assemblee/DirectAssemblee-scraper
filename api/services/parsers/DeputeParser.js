var DateHelper = require('../helpers/DateHelper.js');
var htmlparser = require('htmlparser2');

const SECTION_PREFIX = "content-wrap-"

var deputeParser = function(callback) {
  var parsedItem = {};
  parsedItem.questions = [];
  parsedItem.reports = [];
  parsedItem.propositions = [];
  parsedItem.cosignedPropositions = [];

  var currentSectionItem = {};
  var expectedItem;
  var expectedSection;

  return new htmlparser.Parser({
    onopentag: function(tagname, attribs) {
      if (attribs.class === "tel") {
        expectedItem = "phone";
      } else if (attribs.class === "email") {
        parsedItem.email = attribs.href.replace("mailto:", '')
      } else if (attribs.id && attribs.id.startsWith(SECTION_PREFIX)) {
        expectedSection = attribs.id.split(SECTION_PREFIX)[1];
        console.log(expectedSection)
      } else if (expectedSection) {
        if (tagname === "h4") {
          currentSectionItem = {}
          expectedItem = "section.id";
        } else if (currentSectionItem) {
          if (attribs.href) {
            currentSectionItem.url = attribs.href;
          } else if (tagname === "p") {
            if (!attribs.class) {
              expectedItem = "section.description";
            }
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
      } else if (expectedSection) {
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
            if (expectedSection === "questions") {
              parsedItem.questions.push(currentSectionItem);
            } else if (expectedSection === "propositionsloi") {
              parsedItem.propositions.push(currentSectionItem);
            } else if (expectedSection === "rapportsparlementaires") {
              parsedItem.reports.push(currentSectionItem);
            } else if (expectedSection === "propositionsloicosignataire") {
              parsedItem.cosignedPropositions.push(currentSectionItem);
            }
            expectedItem = null;
            currentSectionItem = null;
          }
        }
      }
    },
    onclosetag: function(tagname) {
      if (tagname == "html") {
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
  console.log(parsedItem.questions);
  console.log(parsedItem.reports);
  console.log(parsedItem.propositions);
  console.log(parsedItem.cosignedPropositions);
  console.log("------------- ");
}
