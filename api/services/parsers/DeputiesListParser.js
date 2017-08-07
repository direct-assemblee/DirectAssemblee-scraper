// http://www2.assemblee-nationale.fr/deputes/liste/departements/(vue)/tableau
'use strict';

var htmlparser = require('htmlparser2');

var deputyParser = function(callback) {
    var resultItems = [];
    var parsedItem = {};

    var expectedData = [ "civility", "firstname", "lastname", "party", "department", "district", "commission", "id" ];
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
                break;
                case 4:
                parsedItem.department = text;
                break;
                case 5:
                parsedItem.district = text;
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
    console.log("officialId : " + parsedItem.officialId);
    console.log("civility : " + parsedItem.civility);
    console.log("firstname : " + parsedItem.firstname);
    console.log("lastname : " + parsedItem.lastname);
    console.log("department : " + parsedItem.department);
    console.log("district : " + parsedItem.district);
    console.log("commission : " + parsedItem.commission);
    console.log("------------- ");
}
