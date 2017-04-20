var Promise = require("bluebird");
var htmlparser = require('htmlparser2');

var extraPositionsParser = function(callback) {
  var extraPositions = [];
  var expectExtraPosition = false;
  var expectExtraPositionValue;
  var expectCommissionValue = false;
  var currentCommissionValue;

  return new htmlparser.Parser({
    onopentag: function(tagname, attribs) {
      if (tagname === 'h4') {
        expectExtraPosition = true;
        expectExtraPositionValue = null;
        expectCommissionValue = null;
      } else if (tagname === "span" && expectExtraPositionValue === "Commissions") {
        currentCommissionValue = "";
        expectCommissionValue = true;
      }
    },
    ontext: function(text) {
      if (expectExtraPosition && (text === "Commissions" || text === "Bureau")) {
        expectExtraPositionValue = text;
        expectExtraPosition = false;
      } else if (expectExtraPositionValue === "Bureau") {
        var trimmed = text.trim();
        if (trimmed.length > 0) {
          extraPositions.push({ 'bureau': trimmed });
          expectExtraPositionValue = null;
        }
      } else if (expectExtraPositionValue === "Commissions" && expectCommissionValue) {
        var trimmed = text.trim();
        if (trimmed.length > 0) {
          if (currentCommissionValue.length > 0) {
            currentCommissionValue += " ";
          }
          currentCommissionValue += trimmed;
        }
      }
    },
    onclosetag: function(tagname) {
      if (tagname === "ul" && expectExtraPositionValue === "Commissions" && expectCommissionValue) {
        if (currentCommissionValue.length > 0) {
          extraPositions.push({ 'commission': currentCommissionValue });
          currentCommissionValue = "";
        }
      } else if (tagname === "html") {
        callback(extraPositions);
      }
    }
  }, {decodeEntities: true});
}

module.exports = {
  parse: function(content) {
    return new Promise(function(resolve, reject) {
      var parser = extraPositionsParser(function(extraPositions) {
        resolve(extraPositions);
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
