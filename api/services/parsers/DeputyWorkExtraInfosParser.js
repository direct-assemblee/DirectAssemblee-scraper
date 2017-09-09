'use strict';

let htmlparser = require('htmlparser2');

let deputyWorkExtraInfosParser = function(callback) {
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
                }
            }
        },
        ontext: function(text) {
            if (expectedItem === 'title') {
                let trimmed = text.trim();
                if (trimmed && trimmed.length > 0) {
                    let separator = trimmed.indexOf('-');
                    trimmed = trimmed.replace('-', ' ').replace(/\s+/g, ' ');
                    let splitText = trimmed.split(' ');
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

module.exports = {
    parse: function(url, content) {
        return new Promise(function(resolve, reject) {
            let parser = deputyWorkExtraInfosParser(function(theme) {
                resolve(theme);
            });
            parser.write(content);
            parser.end();
        })
    }
}
