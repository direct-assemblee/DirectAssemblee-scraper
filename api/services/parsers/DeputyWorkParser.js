'use strict';

var DateHelper = require('../helpers/DateHelper.js');
var htmlparser = require('htmlparser2');

var deputyParser = function(url, callback) {
    var parsedItems = [];
    var currentSectionItem;
    var expectedItem;
    var expectedSection;

    return new htmlparser.Parser({
        onopentag: function(tagname, attribs) {
            if (tagname === "h4") {
                currentSectionItem = {}
                expectedItem = "section.title";
            } else if (currentSectionItem) {
                if (attribs.href && !currentSectionItem.url) {
                    currentSectionItem.url = attribs.href;
                    expectedSection = "description";
                } else if (expectedSection === "description") {
                    if ((tagname === "p" || tagname === "li") && !attribs.class) {
                        expectedItem = "section.description";
                    } else {
                        expectedItem = null;
                    }
                }
            }
        },
        ontext: function(text) {
            if (currentSectionItem) {
                if (expectedItem === "section.title") {
                    currentSectionItem.title = text.trim();
                    if (currentSectionItem.title) {
                        currentSectionItem.title = currentSectionItem.title.replace("-", " ").replace(/\s+/g, ' ');
                        var index = currentSectionItem.title.indexOf("de M");
                        if (index > 0) {
                            currentSectionItem.title = currentSectionItem.title.substring(0, index);
                        }
                        index = currentSectionItem.title.indexOf("n°");
                        if (index > 0) {
                            currentSectionItem.title = currentSectionItem.title.substring(0, index);
                        }
                        expectedItem = "section.date";
                    }
                } else if (expectedItem === "section.date") {
                    var trimmed = text.trim();
                    if (trimmed) {
                        var dateMatched = DateHelper.findDateInString(trimmed);
                        if (dateMatched) {
                            currentSectionItem.date = dateMatched;
                            expectedItem = null;
                        }
                    }
                } else if (expectedItem === "section.description") {
                    var text = text.trim();
                    if (text) {
                        currentSectionItem.description = currentSectionItem.description ? currentSectionItem.description + " - " : "";
                        currentSectionItem.description += text;
                    }
                }
            }
        },
        onclosetag: function(tagname) {
            if (currentSectionItem && (tagname == "ul" || tagname == "div")) {
                if (currentSectionItem.description) {
                    parsedItems.push(currentSectionItem);
                    expectedItem = null;
                    expectedSection = null;
                    currentSectionItem = null;
                }
            } else if (tagname == "html") {
                // print(parsedItems);
                callback(parsedItems);
                parsedItems = null;
                expectedItem = null;
                expectedSection = null;
                currentSectionItem = null;
            }
        }
    }, {decodeEntities: true});
}

module.exports = {
    parse: function(content, url) {
        return new Promise(function(resolve, reject) {
            var parser = deputyParser(url, function(works) {
                resolve(works);
            });
            parser.write(content);
            parser.end();
        })
    }
}

var print = function(parsedItems) {
    for (var i in parsedItems) {
        var parsedItem = parsedItems[i];
        console.log("------------- WORK ");
        console.log("title : " + parsedItem.title);
        console.log("date : " + parsedItem.date);
        console.log("description : " + parsedItem.description);
        console.log("url : " + parsedItem.url);
        console.log("------------- ");
    }
}
