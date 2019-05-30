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
                    expectedItem = 'title';
                } else if (tagname === 'meta' && attribs.content) {
                    if (attribs.name === 'TITRE_DOSSIER') {

                        //Au cas où le site de l'AN utilise ";" comme séparateur au lieu de ":"                        
                        let attribsContent = attribs.content.replace(';', ':');

                        if (attribsContent.indexOf(':') > 0) {
                            let splitted = attribsContent.split(':');
                            let theme = StringHelper.removeParentReference(splitted[0]);
                            let desc = StringHelper.removeParentReference(splitted[1]);
                            parsedItem.description = desc.charAt(0).toUpperCase() + desc.slice(1);
                            if (theme && theme !== 'DOSSIER') {
                                parsedItem.theme = theme;
                            }
                        } else {
                            parsedItem.description = StringHelper.removeParentReference(attribsContent);
                        }
                    }
                }
            },
            ontext: function(text) {
                if (expectedItem === 'title') {
                    let lightText = StringHelper.removeParentReference(text);
                    if (lightText && lightText.length > 0) {
                        let separator = lightText.indexOf('-');
                        lightText = lightText.replace('-', ' ').replace(/\s+/g, ' ');
                        let splitText = lightText.split(' ');
                        let index = splitText.indexOf('N°') + 1;
                        if (index > 0) {
                            parsedItem.id = splitText[index];
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
