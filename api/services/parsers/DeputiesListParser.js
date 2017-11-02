'use strict';

let htmlparser = require('htmlparser2');
let StringHelper = require('../helpers/StringHelper');

module.exports = {
    getParser: function(callback) {
        let resultItems = [];
        let parsedItem = {};

        //let expectedData = [ 'civility', 'firstname', 'lastname', 'party', 'department', 'district', 'commission', 'id' ];
        let expectedDataPos = -1;

        return new htmlparser.Parser({
            onopentag: function(tagname, attribs) {
                if (tagname === 'tr') {
                    expectedDataPos = 0;
                } else if (expectedDataPos === 7 && attribs.href) {
                    let urlSuffix = attribs.href.split('/').pop().replace('OMC_PA', '');
                    let lightText = StringHelper.removeParentReference(urlSuffix);
                    parsedItem.officialId = lightText;
                }
            },
            ontext: function(text) {
                let lightText = StringHelper.removeParentReference(text)
                switch (expectedDataPos) {
                    case 0:
                    parsedItem.civility = lightText;
                    break;
                    case 1:
                    parsedItem.firstname = lightText;
                    break;
                    case 2:
                    parsedItem.lastname = lightText;
                    break;
                    case 3:
                    break;
                    case 4:
                    parsedItem.department = lightText;
                    break;
                    case 5:
                    parsedItem.district = lightText;
                    break;
                    case 6:
                    parsedItem.commission = lightText;
                    break;
                    default:
                    break;
                }
            },
            onclosetag: function(tagname) {
                if (tagname === 'td') {
                    expectedDataPos++;
                } else if (tagname == 'tr' && parsedItem.lastname != null) {
                    expectedDataPos = 0;
                    resultItems.push(parsedItem);
                    // print(parsedItem)
                    parsedItem = {}
                } else if (tagname == 'html') {
                    callback(resultItems);
                }
            }
        }, {decodeEntities: true});
    }
}

let print = function(parsedItem) {
    console.log('------------- ');
    console.log('officialId : ' + parsedItem.officialId);
    console.log('civility : ' + parsedItem.civility);
    console.log('firstname : ' + parsedItem.firstname);
    console.log('lastname : ' + parsedItem.lastname);
    console.log('department : ' + parsedItem.department);
    console.log('district : ' + parsedItem.district);
    console.log('commission : ' + parsedItem.commission);
    console.log('------------- ');
}
