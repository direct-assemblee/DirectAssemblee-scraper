// http://www2.assemblee-nationale.fr/deputes/liste/departements/(vue)/tableau

var htmlparser = require('htmlparser2');

var deputyParser = function(callback) {
  var resultItems = [];
  var parsedItem = {};

  var expectedData = [ "civility", "firstname", "lastname", "party", "department", "subdepartment", "commission", "id" ];
  var expectedDataPos = -1;

  return new htmlparser.Parser({
    onopentag: function(tagname, attribs) {
      if (tagname === "tr") {
        expectedDataPos = 0;
      } else if (expectedDataPos === 7 && attribs.href) {
        var urlSuffix = attribs.href.split('/').pop();
        parsedItem.officialId = urlSuffix.replace('OMC_PA', '');
      }
    },
    ontext: function(text) {
      var expectedDataName = "";
      switch (expectedDataPos) {
        case 0:
          parsedItem.civility = text;
          break;
        case 1:
          parsedItem.firstname = text;
          break;
        case 2:
          parsedItem.lastname = text;
          break;
        case 3:
          parsedItem.party = text;
          break;
        case 4:
          parsedItem.department = text;
          break;
        case 5:
          parsedItem.subdepartment = text;
          break;
        case 6:
          parsedItem.commission = text;
          break;
        default:
          break;
      }
    },
    onclosetag: function(tagname) {
      if (tagname === "td") {
        expectedDataPos++;
      } else if (tagname == "tr" && parsedItem.lastname != null) {
          expectedDataPos = 0;
          resultItems.push(parsedItem);
          // print(parsedItem)
          parsedItem = {}
      } else if (tagname == "html") {
        callback(resultItems);
      }
    }
  }, {decodeEntities: true});
}

module.exports = {
  parse: function(content) {
    return new Promise(function(resolve, reject) {
      var parser = deputyParser(function(resultItems) {
        resolve(resultItems);
      });
      parser.write(content);
      parser.end();
    })
  }
}

var print = function(parsedItem) {
  console.log("------------- ");
  console.log("item : " + parsedItem.officialId);
  console.log("item : " + parsedItem.civility);
  console.log("item : " + parsedItem.firstname);
  console.log("item : " + parsedItem.lastname);
  console.log("item : " + parsedItem.party);
  console.log("item : " + parsedItem.department);
  console.log("item : " + parsedItem.subdepartment);
  console.log("item : " + parsedItem.commission);
  console.log("------------- ");
}
