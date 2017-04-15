// http://www2.assemblee-nationale.fr/scrutins/detail/(legislature)/14/(num)/1304

var DateHelper = require('../helpers/DateHelper.js');
var htmlparser = require('htmlparser2');

var lawListParser = function(lawId, callback) {
  var parsedItem = {};
  parsedItem.officialId = lawId

  var expectedItem;

  return new htmlparser.Parser({
    onopentag: function(tagname, attribs) {
      if (tagname === "title") {
        expectedItem = "date";
      } else if (attribs.class === "president-title") {
        expectedItem = "title";
      }
    },
    ontext: function(text) {
      if (expectedItem === "date") {
        // console.log(text)
        parsedItem.dateDetailed = text.split('-')[1].trim();
        var strDate = parsedItem.dateDetailed.split(' ').pop()
        parsedItem.date = DateHelper.formatDate(strDate);
      } else if (expectedItem === "title") {
        parsedItem.title = text;
      }
      expectedItem = null;
    },
    onclosetag: function(tagname) {
      if (tagname == "html") {
        // print(parsedItem);
        callback(parsedItem);
      }
    }
  }, {decodeEntities: true});
}

module.exports = {
  parse: function(lawId, content, callback) {
    var parser = lawListParser(lawId, function(resultItems) {
      callback(resultItems);
    });
    parser.write(content);
    parser.end();
  }
}

var print = function(parsedItem) {
  console.log("------------- ");
  console.log(parsedItem.officialId);
  console.log(parsedItem.title);
  console.log(parsedItem.date);
  console.log(parsedItem.dateDetailed);
  console.log("------------- ");
}
