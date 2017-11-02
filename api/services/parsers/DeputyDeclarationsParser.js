'use strict';

let htmlparser = require('htmlparser2');
let StringHelper = require('../helpers/StringHelper');

module.exports = {
    getParser: function(callback) {
        let parsedItems = [];
        let expectedItem;
        let currentDecla;

        return new htmlparser.Parser({
            onopentag: function(tagname, attribs) {
                if (attribs.class === 'rubrique-depot') {
                    expectedItem = 'title';
                } else if (attribs.class && attribs.class.startsWith('button button--6') && attribs.href && attribs.href.endsWith('pdf')) {
                    currentDecla = {};
                    currentDecla.url = StringHelper.removeParentReference(attribs.href);
                }
            },
            ontext: function(text) {
                if (expectedItem === 'title') {
                    let lightText = StringHelper.removeParentReference(text);
                    if (lightText && lightText.length > 0) {
                        let info = lightText.split(' déposée le ');
                        currentDecla.title = info[0];
                        currentDecla.date = info[1];
                        parsedItems.push(currentDecla);
                        expectedItem = null;
                    }
                }
            },
            onclosetag: function(tagname) {
                if (tagname == 'html') {
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
