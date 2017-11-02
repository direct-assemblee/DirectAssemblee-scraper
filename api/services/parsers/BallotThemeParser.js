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
                        let wholeTitle = lightText.substring(lightText.indexOf('-') + 2);
                        parsedItem = wholeTitle.split(':')[0].trim();
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
