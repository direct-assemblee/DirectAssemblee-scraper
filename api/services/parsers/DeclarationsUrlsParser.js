'use strict';

let htmlparser = require('htmlparser2');
let StringHelper = require('../helpers/StringHelper');

const HATVP_DEPUTY_URL_START = 'http://www.hatvp.fr/fiche-nominative/?declarant=';

module.exports = {
    getParser: function(callback) {
        let parsedItems = [];
        let expectedItem;
        let currentDecla;

        return new htmlparser.Parser({
            onopentag: function(tagname, attribs) {
                if (attribs.href && attribs.href.startsWith(HATVP_DEPUTY_URL_START)) {
                    let lightText = StringHelper.removeParentReference(attribs.href);
                    parsedItems.push(lightText);
                }
            },
            ontext: function(text) {
            },
            onclosetag: function(tagname) {
                if (tagname === 'html') {
                    // print(parsedItems);
                    callback(parsedItems);
                }
            }
        }, {decodeEntities: true});
    }
}

let print = function(parsedItems) {
    console.log('------------- ');
    console.log(parsedItems);
    console.log('------------- ');
}
