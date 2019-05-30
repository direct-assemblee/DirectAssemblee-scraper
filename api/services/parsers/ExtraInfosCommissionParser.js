'use strict';

let htmlparser = require('htmlparser2');
let StringHelper = require('../helpers/StringHelper');

module.exports = {
    getParser: function(callback) {
        let expectedItem;
        let parsedItem = {};
        parsedItem.extraInfos = [];

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
                                parsedItem.theme = theme
                            }
                        } else {
                            parsedItem.description = StringHelper.removeParentReference(attribsContent);
                        }
                    }
                } else if (attribs.class === 'nomcommission') {
                    expectedItem = 'commissionName';
                } else if (attribs.class === 'SOMseance') {
                    expectedItem = 'commissionTime';
                }
            },
            ontext: function(text) {
                if (expectedItem === 'title' || (expectedItem && expectedItem.startsWith('commission'))) {
                    let lightText = StringHelper.removeParentReference(text);
                    if (lightText && lightText.length > 0) {
                        if (expectedItem === 'title') {
                            let separator = lightText.indexOf('-');
                            lightText = lightText.replace('-', ' ').replace(/\s+/g, ' ');
                            let splitText = lightText.split(' ');
                            let index = splitText.indexOf('N°') + 1;
                            if (index > 0) {
                                parsedItem.id = splitText[index];
                            }
                        } else if (expectedItem === 'commissionName') {
                            parsedItem.extraInfos.push({ info: expectedItem, value: lightText });
                        } else if (expectedItem === 'commissionTime') {
                            parsedItem.extraInfos.push({ info: expectedItem, value: lightText });
                        }
                        expectedItem = null;
                    }
                }
            },
            onclosetag: function(tagname) {
                if (tagname === 'html') {
                    callback(parsedItem);
                    expectedItem = null;
                }
            }
        }, {decodeEntities: true});
    }
}
