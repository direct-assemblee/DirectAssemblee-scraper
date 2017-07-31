// http://www2.assemblee-nationale.fr/scrutins/liste/(offset)/100/(legislature)/14/(type)/TOUS/(idDossier)/TOUS

var htmlparser = require('htmlparser2');

var ballotParser = function(ballotType, callback) {
    var resultItems = [];
    var parsedItem = {};

    var expectedData;
    var currentUrl;

    return new htmlparser.Parser({
        onopentag: function(tagname, attribs) {
            if (tagname === "td" && attribs.class === "denom") {
                expectedData = "id";
            } else if (expectedData === "url") {
                currentUrl = attribs.href;
                expectedData = "urlType";
            }
        },
        ontext: function(text) {
            if (expectedData === "id") {
                if (text.includes('*')) {
                    parsedItem.type = "SSO";
                }
                parsedItem.officialId = text.replace('*', '');
                expectedData = "date";
            } else if (expectedData === "date") {
                if (text.trim()) {
                    parsedItem.date = text;
                    expectedData = "description";
                }
            } else if (expectedData === "description") {
                if (text.trim()) {
                    parsedItem.title = text.replace('[', '').trim();
                    expectedData = "url";
                }
            } else if (expectedData === "urlType") {
                if (text === "dossier") {
                    expectedData = "fileUrl";
                } else if (text === "analyse du scrutin") {
                    expectedData = "analysisUrl";
                }
            }
        },
        onclosetag: function(tagname) {
            if (tagname === "a") {
                if (expectedData === "fileUrl") {
                    parsedItem.fileUrl = currentUrl;
                    currentUrl = null;
                    expectedData = "url";
                } else if (expectedData == "analysisUrl") {
                    parsedItem.analysisUrl = Constants.BASE_URL + currentUrl;
                    currentUrl = null;
                    expectedData = "url";
                }
            } else if (tagname === "tr") {
                if (parsedItem.officialId) {
                    if (parsedItem.title.indexOf("motion de censure") > 0) {
                        parsedItem.type = "motion_of_censure";
                    } else if (!parsedItem.type) {
                        if (ballotType === "TOUS") {
                            ballotType = "SOR"; // default value
                        }
                        parsedItem.type = ballotType;
                    }
                    // print(parsedItem)
                    resultItems.push(parsedItem);
                }
                // print(parsedItem)
                parsedItem = {}
            } else if (tagname === "html") {
                callback(resultItems);
            }
        }
    }, {decodeEntities: true});
}

module.exports = {
    parse: function(content, ballotType) {
        return new Promise(function(resolve, reject) {
            var parser = ballotParser(ballotType, function(resultItems) {
                resolve(resultItems);
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
