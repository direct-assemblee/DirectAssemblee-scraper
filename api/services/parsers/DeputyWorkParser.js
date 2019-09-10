'use strict';

let DateHelper = require('../helpers/DateHelper.js');
let htmlparser = require('htmlparser2');
let StringHelper = require('../helpers/StringHelper');

module.exports = {
    getParser: function(callback) {
        let parsedItems = [];
        let currentItem;
        let expectedItem;
        let expectedSection;

        return new htmlparser.Parser({
            onopentag: function(tagname, attribs) {
                if (tagname === 'h4') {
                    currentItem = {}
                    expectedItem = 'section.subtype';
                } else if (currentItem) {
                    if (attribs.href && !currentItem.url) {
                        currentItem.url = StringHelper.removeParentReference(attribs.href);
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
                if (currentItem) {
                    if (expectedItem === 'section.subtype') {
                        currentItem.subtype = StringHelper.clean(text);
                        if (currentItem.subtype) {
                            // let's make sure we get a name for all items which urls will not load
                            currentItem.name = currentItem.subtype;
                            currentItem.subtype = currentItem.subtype.replace('-', ' ').replace(/\s+/g, ' ');
                            let index = currentItem.subtype.indexOf('de M');
                            if (index > 0) {
                                currentItem.subtype = currentItem.subtype.substring(0, index);
                            }
                            index = currentItem.subtype.indexOf('n°');
                            if (index > 0) {
                                currentItem.subtype = currentItem.subtype.substring(0, index);
                            }
                            currentItem.subtype = currentItem.subtype.trim();
                            expectedItem = 'section.date';
                        }
                    } else if (expectedItem === 'section.date') {
                        let lightText = StringHelper.removeParentReference(text);
                        if (lightText) {
                            let dateMatched = DateHelper.findAndFormatDateInString(lightText);
                            if (dateMatched) {
                                let seanceText = 'séance'
                                let seanceIndex = lightText.toLowerCase().indexOf(seanceText);
                                if (lightText.toLowerCase().includes(seanceText)) {
                                    currentItem.subtype = lightText.substring(0, seanceIndex + seanceText.length)
                                    currentItem.name = lightText.trim();
                                }
                                currentItem.date = dateMatched;
                                expectedItem = null;
                            }
                        }
                    } else if (expectedItem === 'section.description') {
                        let lightText = StringHelper.removeParentReference(text);
                        if (lightText) {
                            currentItem.description = currentItem.description ? currentItem.description + '\n' : '';
                            currentItem.description += lightText;
                        }
                    }
                }
            },
            onclosetag: function(tagname) {
                if (currentItem && (tagname == 'ul' || tagname == 'div')) {
                    if (currentItem.description) {
                        parsedItems.push(currentItem);
                        expectedItem = null;
                        expectedSection = null;
                        currentItem = null;
                    }
                } else if (tagname == 'html') {
                    // print(parsedItems);
                    callback(parsedItems);
                    parsedItems = null;
                    expectedItem = null;
                    expectedSection = null;
                    currentItem = null;
                }
            }
        }, {decodeEntities: true});
    }
}

let print = function(parsedItems) {
    for (let i in parsedItems) {
        let parsedItem = parsedItems[i];
        console.log('------------- WORK ');
        console.log('subtype : ' + parsedItem.subtype);
        console.log('date : ' + parsedItem.date);
        console.log('description : ' + parsedItem.description);
        console.log('url : ' + parsedItem.url);
        console.log('------------- ');
    }
}
