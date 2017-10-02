'use strict';

let htmlparser = require('htmlparser2');

let lawProposalExtraInfosParser = function(callback) {
    let parsedItem = {};
    let expectedItem;

    return new htmlparser.Parser({
        onopentag: function(tagname, attribs) {
            if (tagname === 'title') {
                expectedItem = 'title';
            } else if (tagname === 'meta' && attribs.content) {
                if (attribs.name === 'TITRE_DOSSIER') {
                    if (attribs.content.indexOf(':') > 0) {
                        let splitted = attribs.content.split(':');
                        let theme = splitted[0].trim()
                        let desc = splitted[1].trim()
                        parsedItem.description = desc.charAt(0).toUpperCase() + desc.slice(1);
                        if (theme && theme !== 'DOSSIER') {
                            parsedItem.theme = theme
                        }
                    } else {
                        parsedItem.description = attribs.content;
                    }
                    expectedItem = 'motives';
                }
            } else if (tagname === 'table' && expectedItem === 'motives_text' && parsedItem.extraInfo) {
                parsedItem.extraInfo += '\nVeuillez consulter la suite sur le site officiel de l\'Assemblée Nationale';
                expectedItem = null;
            }
        },
        ontext: function(text) {
            if (expectedItem === 'title' || expectedItem === 'motives' || expectedItem === 'motives_text') {
                let trimmed = text.trim();
                if (trimmed && trimmed.length > 0) {
                    if (expectedItem === 'title') {
                        let separator = trimmed.indexOf('-');
                        trimmed = trimmed.replace('-', ' ').replace(/\s+/g, ' ');
                        let splitText = trimmed.split(' ');
                        let index = splitText.indexOf('N°') + 1;
                        if (index > 0) {
                            parsedItem.id = splitText[index];
                        }
                    } else if (expectedItem === 'motives') {
                        if (trimmed === 'EXPOSÉ DES MOTIFS') {
                            expectedItem = 'motives_text';
                            parsedItem.extraInfo = '';
                        } else if (trimmed.startsWith('Ce document qui a fait l\'objet d\'un dépôt officiel')) {
                            parsedItem.extraInfo = 'Informations bientôt disponibles.'
                        }
                    } else if (expectedItem === 'motives_text') {
                        if (parsedItem.extraInfo && parsedItem.extraInfo.length > 0 && (trimmed.startsWith('PROPOSITION DE LOI') || trimmed.startsWith('PROPOSITION DE RÉSOLUTION'))) {
                            expectedItem = null;
                        } else {
                            parsedItem.extraInfo += trimmed + ' ';
                        }
                    }
                }
            }
        },
        onclosetag: function(tagname) {
            if (tagname === 'html') {
                expectedItem = null;
                callback(parsedItem);
            } else if (tagname === 'p' && expectedItem && parsedItem.extraInfo) {
                parsedItem.extraInfo += '\n';
            }
        }
    }, {decodeEntities: true});
}

module.exports = {
    parse: function(url, content) {
        return new Promise(function(resolve, reject) {
            let parser = lawProposalExtraInfosParser(function(theme) {
                resolve(theme);
            });
            parser.write(content);
            parser.end();
        })
    }
}