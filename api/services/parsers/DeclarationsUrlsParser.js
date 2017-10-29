'use strict';

let htmlparser = require('htmlparser2');
const HATVP_DEPUTY_URL_START = 'http://www.hatvp.fr/fiche-nominative/?declarant=';

let declarationsUrlsParser = function(callback) {
    let parsedItems = [];
    let expectedItem;
    let currentDecla;

    return new htmlparser.Parser({
        onopentag: function(tagname, attribs) {
            if (attribs.href && attribs.href.startsWith(HATVP_DEPUTY_URL_START)) {
                parsedItems.push(attribs.href);
            }
        },
        ontext: function(text) {
        },
        onclosetag: function(tagname) {
            if (tagname == 'html') {
                // print(parsedItems);
                callback(parsedItems);
            }
        }
    }, {decodeEntities: true});
}

module.exports = {
    parse: function(content) {
        return new Promise(function(resolve, reject) {
            let parser = declarationsUrlsParser(function(urls) {
                resolve(urls);
            });
            parser.write(content);
            parser.end();
        })
    }
}

let print = function(parsedItems) {
    console.log('------------- ');
    console.log(parsedItems);
    console.log('------------- ');
}
