'use strict';

let htmlparser = require('htmlparser2');
let StringHelper = require('../helpers/StringHelper');

module.exports = {
    getParser: function(callback) {
        let parsedItem = {};
        let expectedItem;
        let currentDecla;

        return new htmlparser.Parser({
            onopentag: function(tagname, attribs) {
                if (tagname === 'title') {
                    expectedItem = 'title';
                } else if (attribs.class === 'deputy-healine-sub-title') {
                    expectedItem = 'type';
                }
            },
            ontext: function(text) {
                if (expectedItem === 'title' || expectedItem === 'type') {
                    let lightText = StringHelper.removeParentReference(text);
                    if (lightText && lightText.length > 0) {
                        if (expectedItem === 'title') {
                            let endOfTitle = lightText.lastIndexOf('(');
                            if (endOfTitle == -1) {
                                endOfTitle = lightText.lastIndexOf('-');
                            }
                            let titleLength = lightText.length - (lightText.length - endOfTitle);
                            parsedItem.originalThemeName = lightText.substring(0, titleLength);
                        } else {
                            parsedItem.title = lightText;
                        }
                        expectedItem = null;
                    }
                }

            },
            onclosetag: function(tagname) {
                if (tagname === 'html') {
                    // print(parsedItem);
                    callback(parsedItem);
                }
            }
        }, {decodeEntities: true});
    }
}

let print = function(parsedItem) {
    console.log('------------- ');
    console.log(parsedItem);
    console.log('------------- ');
}
