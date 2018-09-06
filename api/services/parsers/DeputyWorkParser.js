'use strict';

let DateHelper = require('../helpers/DateHelper.js');
let htmlparser = require('htmlparser2');
let StringHelper = require('../helpers/StringHelper');

module.exports = {
    getParser: function(callback) {
        let parsedItems = [];
        let currentSectionItem;
        let expectedItem;
        let expectedSection;

        return new htmlparser.Parser({
            onopentag: function(tagname, attribs) {
                if (tagname === 'h4') {
                    currentSectionItem = {}
                    expectedItem = 'section.title';
                } else if (currentSectionItem) {
                    if (attribs.href && !currentSectionItem.url) {
                        currentSectionItem.url = StringHelper.removeParentReference(attribs.href);
                        expectedSection = 'description';
                    } else if (expectedSection === 'description') {
                        if ((tagname === 'p' || tagname === 'li') && !attribs.class) {
                            expectedItem = 'section.description';
                        } else {
                            expectedItem = null;
                        }
                    }
                }
            },
            ontext: function(text) {
                if (currentSectionItem) {
                    if (expectedItem === 'section.title') {
                        currentSectionItem.title = StringHelper.removeParentReference(text);
                        if (currentSectionItem.title) {
                            currentSectionItem.title = currentSectionItem.title.replace('-', ' ').replace(/\s+/g, ' ');
                            let index = currentSectionItem.title.indexOf('de M');
                            if (index > 0) {
                                currentSectionItem.title = currentSectionItem.title.substring(0, index);
                            }
                            index = currentSectionItem.title.indexOf('n°');
                            if (index > 0) {
                                currentSectionItem.title = currentSectionItem.title.substring(0, index);
                            }
                            expectedItem = 'section.date';
                        }
                    } else if (expectedItem === 'section.date') {
                        let lightText = StringHelper.removeParentReference(text);
                        if (lightText) {
                            let dateMatched = DateHelper.findAndFormatDateInString(lightText);
                            if (dateMatched) {
                                let seanceText = 'séance'
                                let seanceIndex = lightText.indexOf(seanceText);
                                if (lightText.includes(seanceText)) {
                                    currentSectionItem.title = lightText.substring(0, seanceIndex + seanceText.length)
                                }
                                currentSectionItem.date = dateMatched;
                                expectedItem = null;
                            }
                        }
                    } else if (expectedItem === 'section.description') {
                        let lightText = StringHelper.removeParentReference(text);
                        if (lightText) {
                            currentSectionItem.description = currentSectionItem.description ? currentSectionItem.description + '\n' : '';
                            currentSectionItem.description += lightText;
                        }
                    }
                }
            },
            onclosetag: function(tagname) {
                if (currentSectionItem && (tagname == 'ul' || tagname == 'div')) {
                    if (currentSectionItem.description) {
                        parsedItems.push(currentSectionItem);
                        expectedItem = null;
                        expectedSection = null;
                        currentSectionItem = null;
                    }
                } else if (tagname == 'html') {
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
}

let print = function(parsedItems) {
    for (let i in parsedItems) {
        let parsedItem = parsedItems[i];
        console.log('------------- WORK ');
        console.log('title : ' + parsedItem.title);
        console.log('date : ' + parsedItem.date);
        console.log('description : ' + parsedItem.description);
        console.log('url : ' + parsedItem.url);
        console.log('------------- ');
    }
}
