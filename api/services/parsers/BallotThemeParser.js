let htmlparser = require('htmlparser2');
let StringHelper = require('../helpers/StringHelper');

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
                        let endOfTitle = lightText.lastIndexOf('(');
                        if (endOfTitle == -1) {
                            endOfTitle = lightText.lastIndexOf('-');
                        }
                        let titleLength = lightText.length - (lightText.length - endOfTitle);
                        let wholeTitle = lightText.substring(0, titleLength);
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
