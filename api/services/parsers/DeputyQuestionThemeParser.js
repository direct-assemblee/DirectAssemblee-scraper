'use strict';

let htmlparser = require('htmlparser2');
let Constants = require('../Constants.js')

let questionParser = function(callback) {
    let expectRubrique;
    let expectRubriqueValue;

    return new htmlparser.Parser({
        onopentag: function(tagname, attribs) {
            if (attribs.class === 'question_col33') {
                expectRubrique = true;
            }
        },
        ontext: function(text) {
            if (expectRubrique && text.startsWith('Rubrique')) {
                expectRubriqueValue = true;
            } else if (expectRubriqueValue) {
                text = text.trim();
                let theme = text.charAt(0).toUpperCase() + text.slice(1);
                callback(theme);
                expectRubrique = null;
                expectRubriqueValue = null;
            }
        },
        onclosetag: function(tagname) {
        }
    }, {decodeEntities: true});
}

module.exports = {
    parse: function(url, content, workType) {
        return new Promise(function(resolve, reject) {
            if (workType === Constants.WORK_TYPE_QUESTIONS) {
                let parser = questionParser(function(theme) {
                    resolve(theme);
                });
                parser.write(content);
                parser.end();
            } else if (workType === Constants.WORK_TYPE_REPORTS) {
                resolve();
            }
        })
    }
}
