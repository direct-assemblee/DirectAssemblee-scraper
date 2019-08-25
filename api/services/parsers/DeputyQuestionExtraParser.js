'use strict';

let htmlparser = require('htmlparser2');
let StringHelper = require('../helpers/StringHelper');

module.exports = {
    getParser: function(callback) {
        let parsedItem = {}
        let expectedItem;
        let theme;

        return new htmlparser.Parser({
            onopentag: function(tagname, attribs) {
                if (attribs.class === 'question_col33') {
                    if (expectedItem == null) {
                        expectedItem = 'themeSection';
                    } else {
                        expectedItem = 'titleSection';
                    }
                }
            },
            ontext: function(text) {
                if (expectedItem != null) {
                    let lightText = StringHelper.removeParentReference(text);
                    if (lightText) {
                        if (expectedItem === 'themeSection' && lightText.startsWith('Rubrique')) {
                            expectedItem = 'themeValue';
                        } else if (expectedItem === 'titleSection' && lightText.startsWith('Titre')) {
                            expectedItem = 'titleValue';
                        } else if (expectedItem === 'themeValue' || expectedItem === 'titleValue') {
                            let value = lightText.charAt(0).toUpperCase() + lightText.slice(1);
                            if (expectedItem === 'themeValue') {
                                parsedItem.theme = value
                            } else {
                                parsedItem.name = value
                                expectedItem = null;
                            }
                        }
                    }
                }
            },
            onclosetag: function(tagname) {
                if (tagname === 'html') {
                    callback(parsedItem);
                }
            }
        }, { decodeEntities: true });
    }
}
