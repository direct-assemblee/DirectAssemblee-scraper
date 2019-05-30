'use strict';

let htmlparser = require('htmlparser2');
let StringHelper = require('../helpers/StringHelper');

module.exports = {
    getParser: function(callback) {
        let parsedItem = {};
        let expectedItem;
        let extraInfo;

        return new htmlparser.Parser({
            onopentag: function(tagname, attribs) {
                if (tagname === 'title') {
                    expectedItem = 'title';
                } else if (tagname === 'meta' && attribs.content) {
                    if (attribs.name === 'TITRE_DOSSIER') {

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
                        expectedItem = 'motives';
                    }
                } else if (tagname === 'table' && expectedItem === 'motives_text' && extraInfo) {
                    let lastSentenceEnd = regexLastIndexOf(extraInfo, /[.?!]/)
                    if (lastSentenceEnd > 0) {
                        extraInfo = extraInfo.substr(0, lastSentenceEnd + 1)
                    }
                    extraInfo += ' Vous pouvez consulter la suite sur le site officiel de l\'Assemblée Nationale.';
                    expectedItem = null;
                }
            },
            ontext: function(text) {
                if (expectedItem === 'title' || expectedItem === 'motives' || expectedItem === 'motives_text') {
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
                        } else if (expectedItem === 'motives') {
                            if (lightText === 'EXPOSÉ DES MOTIFS') {
                                expectedItem = 'motives_text';
                                extraInfo = '';
                            } else if (lightText.startsWith('Ce document qui a fait l\'objet d\'un dépôt officiel')) {
                                extraInfo = 'Informations bientôt disponibles.'
                            }
                        } else if (expectedItem === 'motives_text') {
                            if (extraInfo && extraInfo.length > 0 && (lightText.startsWith('PROPOSITION DE LOI') || lightText.startsWith('PROPOSITION DE RÉSOLUTION'))) {
                                expectedItem = null;
                            } else {
                                extraInfo += lightText + ' ';
                            }
                        }
                    }
                }
            },
            onclosetag: function(tagname) {
                if (tagname === 'html') {
                    expectedItem = null;
                    parsedItem.extraInfos = [];
                    if (extraInfo && extraInfo.length > 0) {
                        if (extraInfo[extraInfo.length - 1] == '\n') {
                            extraInfo = extraInfo.substr(0, extraInfo.length - 1).trim();
                        }
                        extraInfo = extraInfo.replace(/\n/g, '\n\n')
                    }
                    parsedItem.extraInfos.push({ info: 'lawMotives', value: extraInfo });
                    callback(parsedItem);
                } else if (tagname === 'p' && expectedItem && extraInfo) {
                    extraInfo += '\n';
                }
            }
        }, {decodeEntities: true});
    }
}

let regexLastIndexOf = function(str, regex) {
    var match = str.match(regex);
    return str.lastIndexOf(match[match.length-1]);
}
