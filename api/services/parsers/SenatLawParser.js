'use strict';

let htmlparser = require('htmlparser2');
let StringHelper = require('../helpers/StringHelper');

module.exports = {
    getParser: function(callback) {
        let parsedTheme;
        let expectedItem;;

        return new htmlparser.Parser({
            onopentag: function(tagname, attribs) {
                if (tagname === 'div' && attribs.id === 'box-themes') {
                    expectedItem = 'themeContainer';
                } else if (expectedItem === 'themeContainer') {
                    if (attribs.class === 'last') {
                        expectedItem = null;
                    } else if (attribs.href) {
                        expectedItem = 'theme';
                    }
                }
            },
            ontext: function(text) {
                if (expectedItem === 'theme') {
                    let lightText = StringHelper.removeParentReference(text);
                    if (lightText && lightText.length > 0) {
                        parsedTheme = lightText;
                        expectedItem = null;
                    }
                }
            },
            onclosetag: function(tagname) {
                if (tagname === 'html') {
                    // print(parsedItem);
                    callback(parsedTheme);
                    return;
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
