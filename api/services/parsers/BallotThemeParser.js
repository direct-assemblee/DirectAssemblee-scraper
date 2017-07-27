var htmlparser = require('htmlparser2');

var ballotThemeParser = function(callback) {
    var parsedItem;
    var expectedItem;

    return new htmlparser.Parser({
        onopentag: function(tagname, attribs) {
            if (tagname === "title") {
                expectedItem = "title";
            }
        },
        ontext: function(text) {
            if (expectedItem === "title") {
                var wholeTitle = text.substring(text.indexOf('-') + 2);
                parsedItem = wholeTitle.split(':')[0].trim();
            }
        },
        onclosetag: function(tagname) {
            if (tagname === "title") {
                callback(parsedItem);
            }
        }
    }, {decodeEntities: true});
}

module.exports = {
    parse: function(content) {
        return new Promise(function(resolve, reject) {
            var parser = ballotThemeParser(function(theme) {
                resolve(theme);
            });
            parser.write(content);
            parser.end();
        })
    }
}

var print = function(parsedItem) {
    console.log("------------- ");
    console.log(parsedItem)
    console.log("------------- ");
}
