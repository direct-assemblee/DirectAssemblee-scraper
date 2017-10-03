'use strict';

let htmlparser = require('htmlparser2');

let extraInfosCommissionParser = function(callback) {
    let expectedItem;
    let parsedItem = {};
    parsedItem.extraInfos = [];

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
                }
            } else if (attribs.class === 'nomcommission') {
                expectedItem = 'commission_name';
            } else if (attribs.class === 'SOMdate') {
                expectedItem = 'commission_date';
            } else if (attribs.class === 'SOMseance') {
                expectedItem = 'commission_time';
            }
        },
        ontext: function(text) {
            if (expectedItem === 'title' || (expectedItem && expectedItem.startsWith('commission_'))) {
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
                    } else if (expectedItem === 'commission_name') {
                        parsedItem.extraInfos.push({ label: 'Nom de la commission', text: trimmed });
                    } else if (expectedItem === 'commission_date') {
                        parsedItem.extraInfos.push({ label: '', text: trimmed });
                    } else if (expectedItem === 'commission_time') {
                        parsedItem.extraInfos.push({ label: '', text: trimmed });
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

module.exports = {
    parse: function(url, content) {
        return new Promise(function(resolve, reject) {
            let parser = extraInfosCommissionParser(function(theme) {
                resolve(theme);
            });
            parser.write(content);
            parser.end();
        })
    }
}
