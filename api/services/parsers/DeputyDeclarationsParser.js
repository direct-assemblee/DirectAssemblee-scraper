'use strict';

let htmlparser = require('htmlparser2');

let declarationsParser = function(callback) {
    let parsedItems = [];
    let expectedItem;
    let currentDecla;

    return new htmlparser.Parser({
        onopentag: function(tagname, attribs) {
            if (attribs.class === 'rubrique-depot') {
                expectedItem = 'title';
            } else if (attribs.class && attribs.class.startsWith('button button--6') && attribs.href && attribs.href.endsWith('pdf')) {
                currentDecla = {};
                currentDecla.url = attribs.href;
            }
        },
        ontext: function(text) {
            if (expectedItem === 'title') {
                let trimmed = text.trim();
                if (trimmed.length > 0) {
                    if (expectedItem === 'title') {
                        let info = trimmed.split(' déposée le ');
                        currentDecla.title = info[0];
                        currentDecla.date = info[1];
                        parsedItems.push(currentDecla);
                        expectedItem = null;
                    }
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

module.exports = {
    parse: function(content) {
        return new Promise(function(resolve, reject) {
            let parser = declarationsParser(function(declarations) {
                resolve(declarations);
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
