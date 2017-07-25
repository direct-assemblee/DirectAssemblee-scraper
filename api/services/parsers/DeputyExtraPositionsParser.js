'use strict';

var Promise = require("bluebird");
var htmlparser = require('htmlparser2');

const MULTI_LINE_POSITIONS = [ "Commissions", "Délégations et Office" ];

var extraPositionsParser = function(callback) {
  var extraPositions = [];
  var expectExtraPosition = false;
  var expectedExtraPositionValue;
  var expectExtraPositionValue = false;
  var currentExtraPositionValue;

  return new htmlparser.Parser({
    onopentag: function(tagname, attribs) {
      if (tagname === 'h4') {
        expectExtraPosition = true;
        expectedExtraPositionValue = null;
        expectExtraPositionValue = false;
      } else if (tagname === "span" && MULTI_LINE_POSITIONS.includes(expectedExtraPositionValue)) {
        currentExtraPositionValue = {};
        expectExtraPositionValue = true;
      }
    },
    ontext: function(text) {
      if (expectExtraPosition && (text === "Bureau" || MULTI_LINE_POSITIONS.includes(text))) {
        expectedExtraPositionValue = text;
        expectExtraPosition = false;
      } else if (expectedExtraPositionValue === "Bureau") {
        var trimmed = text.trim();
        if (trimmed.length > 0) {
          var positionEnd = trimmed.indexOf("de l'Assemblée nationale")
          extraPositions.push({ 'type': 'bureau', 'position': trimmed.substring(0, positionEnd), 'office': "Assemblée nationale" });
          expectedExtraPositionValue = null;
        }
      } else if (MULTI_LINE_POSITIONS.includes(expectedExtraPositionValue) && expectExtraPositionValue) {
        var trimmed = text.trim();
        if (trimmed.length > 0 && currentExtraPositionValue) {
          if (currentExtraPositionValue.position) {
            currentExtraPositionValue.office = trimmed;
          } else {
            currentExtraPositionValue.position = trimmed;
          }
        }
      }
    },
    onclosetag: function(tagname) {
      if (tagname === "ul" && MULTI_LINE_POSITIONS.includes(expectedExtraPositionValue) && expectExtraPositionValue) {
        if (currentExtraPositionValue) {
          var type;
          if (expectedExtraPositionValue === 'Commissions') {
            type = "commissions";
          } else {
            type = "délégations et office";
          }
          extraPositions.push({ 'type': type, 'position': currentExtraPositionValue.position, 'office': currentExtraPositionValue.office });
          currentExtraPositionValue = null;
        }
      } else if (tagname == "div") {
        expectedExtraPositionValue = null;
        expectExtraPositionValue = false;
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

var print = function(parsedItems) {
  for (var i in parsedItems) {
    var parsedItem = parsedItems[i];
    console.log("------------- EXTRA POSITIONS");
    console.log("type : " + parsedItem.type);
    console.log("position : " + parsedItem.position);
    console.log("office : " + parsedItem.office);
    console.log("------------- ");
  }
}
