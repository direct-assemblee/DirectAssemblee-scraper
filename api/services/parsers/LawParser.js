'use strict';

let htmlparser = require('htmlparser2');
let StringHelper = require('../helpers/StringHelper');

let USELESS_PARENTHESIS = /\([0-9]+\)/g;

module.exports = {
    getParser: function(callback) {
        let parsedItem = {};
        let expectedItem;

        return new htmlparser.Parser({
            onopentag: function(tagname, attribs) {
                if (tagname === 'title') {
                    expectedItem = 'name';
                } else if (attribs.class === 'deputy-healine-sub-title') {
                    expectedItem = 'type';
                } else if (attribs.class === 'titre-majuscul-gris-senat') {
                    expectedItem = 'urlSenat';
                } else if (expectedItem === 'urlSenat' && attribs.href) {
                    let parsedUrl = StringHelper.removeParentReference(attribs.href);
                    if (parsedUrl != null && parsedUrl != "#") {
                        parsedItem.urlSenat = parsedUrl;
                    }
                    expectedItem = null;
                }
            },
            ontext: function(text) {
                if (expectedItem === 'name' || expectedItem === 'type') {
                    let lightText = StringHelper.removeParentReference(text);
                    if (lightText && lightText.length > 0) {
                        if (expectedItem === 'name') {
                            let endOfTitle = lightText.lastIndexOf('(');
                            if (endOfTitle == -1) {
                                endOfTitle = lightText.lastIndexOf('-');
                            }
                            let titleLength = lightText.length - (lightText.length - endOfTitle);
                            let wholeTitle = lightText.substring(0, titleLength);
                            let split = wholeTitle.split(':');
                            if (split) {
                                parsedItem = {};
                                if (split.length > 1 && split[1].trim().length > 0) {
                                    parsedItem.originalTheme = split[0].trim();
                                    parsedItem.name = split[1].trim();
                                    if (parsedItem.name) {
                                        parsedItem.name = parsedItem.name.replace(USELESS_PARENTHESIS, '');
                                    }
                                } else {
                                    parsedItem.name = split[0].trim();    
                                }
                            }
                        } else {
                            parsedItem.typeName = lightText;
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