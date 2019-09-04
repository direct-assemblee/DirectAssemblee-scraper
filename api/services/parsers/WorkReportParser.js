'use strict';

let htmlparser = require('htmlparser2');
let StringHelper = require('../helpers/StringHelper');

module.exports = {
    getParser: function(callback) {
        let parsedItem = {};
        let expectedItem;

        return new htmlparser.Parser({
            onopentag: function(tagname, attribs) {
                if (tagname === 'title') {
                    expectedItem = 'description';
                } else if (tagname === 'meta' && attribs.content) {
                    if (attribs.name === 'TITRE_DOSSIER') {
                        //Au cas où le site de l'AN utilise ";" comme séparateur au lieu de ":"
                        let attribsContent = attribs.content.replace(';', ':');
                        if (attribsContent.indexOf(':') > 0) {
                            let splitted = attribsContent.split(':');
                            let theme = StringHelper.removeParentReference(splitted[0]);
                            let desc = StringHelper.removeParentReference(splitted[1]);
                            parsedItem.name = desc.charAt(0).toUpperCase() + desc.slice(1);
                            if (theme && theme !== 'DOSSIER') {
                                parsedItem.theme = theme;
                            }
                        } else {
                            parsedItem.name = StringHelper.removeParentReference(attribsContent);
                        }
                    }
                }
            },
            ontext: function(text) {
                if (expectedItem === 'description') {
                    let lightText = StringHelper.removeParentReference(text);
                    if (lightText && lightText.length > 0) {
                        let splitText = lightText.split('-');
                        if (splitText.length > 1 && splitText[1].trim().length > 0) {
                            parsedItem.description = splitText[1].trim();
                        } else {
                            parsedItem.description = splitText[0].trim();
                        }
                    }
                    expectedItem = null;
                }
            },
            onclosetag: function(tagname) {
                if (tagname === 'head') {
                    callback(parsedItem);
                    expectedItem = null;
                }
            }
        }, {decodeEntities: true});
    }
}
