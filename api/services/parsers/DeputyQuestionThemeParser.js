'use strict';

let htmlparser = require('htmlparser2');
let StringHelper = require('../helpers/StringHelper');

module.exports = {
    getParser: function(callback) {
        let expectRubrique;
        let expectRubriqueValue;
        let theme;

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
                    let lightText = StringHelper.removeParentReference(text);
                    theme = lightText.charAt(0).toUpperCase() + lightText.slice(1);
                    expectRubrique = null;
                    expectRubriqueValue = null;
                }
            },
            onclosetag: function(tagname) {
                if (tagname === 'html') {
                    callback(theme);
                }
            }
        }, {decodeEntities: true});
    }
}
