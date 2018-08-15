let htmlparser = require('htmlparser2');
let StringHelper = require('../helpers/StringHelper');
let WorkAndBallotTypeHelper = require('../helpers/WorkAndBallotTypeHelper');

module.exports = {
    getParser: function(callback) {
        let resultItems = [];
        let parsedItem = {};

        let expectedData;
        let currentUrl;

        return new htmlparser.Parser({
            onopentag: function(tagname, attribs) {
                if (tagname === 'td' && attribs.class === 'denom') {
                    expectedData = 'id';
                } else if (expectedData === 'url') {
                    currentUrl = StringHelper.removeParentReference(attribs.href);
                    expectedData = 'urlType';
                }
            },
            ontext: function(text) {
                if (isInteresting(expectedData, text)) {
                    let lightText = StringHelper.removeParentReference(text);
                    if (lightText && lightText.length > 0) {
                        if (expectedData === 'id') {
                            if (lightText.includes('*')) {
                                parsedItem.type = WorkAndBallotTypeHelper.BALLOT_OFFICIAL_TYPE_SOLEMN;
                            }
                            parsedItem.officialId = lightText.replace('*', '');
                            expectedData = 'date';
                        } else if (expectedData === 'date') {
                            parsedItem.date = lightText;
                            expectedData = 'description';
                        } else if (expectedData === 'description') {
                            parsedItem.title = lightText.replace('[', '').trim();
                            expectedData = 'url';
                        } else if (expectedData === 'urlType') {
                            if (text === 'dossier') {
                                expectedData = 'fileUrl';
                            } else if (text === 'analyse du scrutin') {
                                expectedData = 'analysisUrl';
                            }
                        }
                    }
                }
            },
            onclosetag: function(tagname) {
                if (tagname === 'a') {
                    if (expectedData === 'fileUrl') {
                        parsedItem.fileUrl = currentUrl;
                        currentUrl = null;
                        expectedData = 'url';
                    } else if (expectedData == 'analysisUrl') {
                        parsedItem.analysisUrl = Constants.BASE_URL + currentUrl;
                        currentUrl = null;
                        expectedData = 'url';
                    }
                } else if (tagname === 'tr') {
                    if (parsedItem.officialId) {
                        // print(parsedItem)
                        resultItems.push(parsedItem);
                    }
                    parsedItem = {}
                } else if (tagname === 'html') {
                    callback(resultItems);
                }
            }
        }, {decodeEntities: true});
    }
}

let isInteresting = function(expectedData, text) {
    return expectedData === 'id' || expectedData === 'date' || expectedData === 'description' || expectedData === 'urlType';
}

let print = function(parsedItem) {
    console.log('------------- ');
    console.log(parsedItem);
    console.log('------------- ');
}
