// http://www2.assemblee-nationale.fr/deputes/votes/(offset)/0/(id_omc)/OMC_PA605036/(legislature)/14
var Promise = require("bluebird");
var htmlparser = require('htmlparser2');

var votesParser = function(deputeId, callback) {
  var resultItems = [];
  var parsedItem = {};

  var expectvalue = false;
  var expectLawHref = false;
  var expectAlertInfoSpan = false;
  var expectAlertInfoValue = false;

  return new htmlparser.Parser({
    onopentag: function(tagname, attribs) {
      if (attribs.class === "position_vote label") {
        expectvalue = true;
      } else if (attribs.href && expectLawHref) {
        parsedItem.lawId = attribs.href.split('/').pop();
        parsedItem.deputeId = deputeId;
      } else if (attribs.class === "alert alert-info") {
        expectAlertInfoSpan = true;
      } else if (expectAlertInfoSpan && tagname === "span") {
        expectvalue = true;
        expectAlertInfoValue = true;
        expectAlertInfoSpan = false;
      }
    },
    ontext: function(text) {
      if (expectvalue) {
        if (expectAlertInfoValue) {
          parsedItem.value = text.split(" ").pop();
          expectAlertInfoValue = false;
        } else {
          parsedItem.value = text;
        }
        if (parsedItem.value) {
          expectvalue = false;
          expectLawHref = true;
        }
      }
    },
    onclosetag: function(tagname) {
      if (tagname === "li" && expectLawHref) {
        expectLawHref = false;
        resultItems.push(parsedItem);
        // print(parsedItem)
        parsedItem = {}
      } else if (tagname === "span" && expectvalue) {
        expectvalue = false;
        expectAlertInfoSpan = true;
      } else if (tagname == "html") {
        callback(resultItems);
      }
    }
  }, {decodeEntities: true});
}

module.exports = {
  parse: function(deputeId, content) {
    return new Promise(function(resolve, reject) {
      var parser = votesParser(deputeId, function(resultItems) {
        resolve(resultItems);
      });
      parser.write(content);
      parser.end();
    })
  }
}

var print = function(parsedItem) {
  console.log("------------- ");
  console.log(parsedItem.value);
  console.log(parsedItem.deputeId);
  console.log(parsedItem.lawId);
  console.log("------------- ");
}
