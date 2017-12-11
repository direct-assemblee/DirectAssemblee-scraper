let htmlparser = require('htmlparser2');
let StringHelper = require('../helpers/StringHelper');

let USELESS_PARENTHESIS = /\([0-9]+\)/g;

module.exports = {
    getParser: function(callback) {
        let parsedItem;
        let expectedItem;

        return new htmlparser.Parser({
            onopentag: function(tagname, attribs) {
                if (tagname === 'title') {
                    expectedItem = 'title';
                }
            },
            ontext: function(text) {
                if (expectedItem === 'title') {
                    let lightText = StringHelper.removeParentReference(text);
                    if (lightText && lightText.length > 0) {
                        let wholeTitle = lightText.substring(lightText.indexOf('-') + 2);
                        let split = wholeTitle.split(':');
                        if (split) {
                            parsedItem = {};
                            if (split.length > 0 && split[0].trim().length > 0) {
                                parsedItem.theme = split[0].trim();
                            }
                            if (split.length > 1 && split[1].trim().length > 0) {
                                parsedItem.themeDetail = split[1].trim();
                                if (parsedItem.themeDetail) {
                                    parsedItem.themeDetail = parsedItem.themeDetail.replace(USELESS_PARENTHESIS, '');
                                }
                            }
                            expectedItem = null;
                        }
                    }
                }
            },
            onclosetag: function(tagname) {
                if (tagname === 'title') {
                    callback(parsedItem);
                }
            }
        }, {decodeEntities: true});
    }
}

let print = function(parsedItem) {
    console.log('------------- ');
    console.log(parsedItem)
    console.log('------------- ');
}
