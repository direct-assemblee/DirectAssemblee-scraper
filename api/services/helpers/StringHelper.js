let entities = require('html-entities').AllHtmlEntities;

var defaultDiacriticsRemovalMap = require('./DefaultDiacriticsRemovalMap.js');
var diacriticsMap = {};
for (var i = 0; i < defaultDiacriticsRemovalMap .length; i++) {
    var letters = defaultDiacriticsRemovalMap[i].letters;
    for (var j = 0; j < letters.length ; j++) {
        diacriticsMap[letters[j]] = defaultDiacriticsRemovalMap[i].base;
    }
}

let self = module.exports = {
    cleanHtml: function(content) {
        let cleaned = content.replace(/&quot;/g, '\'');
        cleaned = entities.decode(cleaned);
        cleaned = self.removeSpecialChars(cleaned);
        return cleaned
    },

    removeSpecialChars: function(str) {
        return str.replace(/\.\r\n/g, '[dotspace]')
        .replace(/\s+/g, ' ')
        .replace(/\\n/g, ' ')
        .replace(/\\'/g, '\'')
        .replace(/\\'/g, '\'')
        .replace(/\\&/g, '')
        .replace(/\\r/g, '')
        .replace(/\\t/g, '')
        .replace(/\\b/g, '')
        .replace(/\\f/g, '')
        .replace('&quot;', '')
        .replace('data-place', 'dataplace')
        .replace(/\[dotspace\]/g, '.<br>');
    },

    replaceAccents: function(str) {
        return str.replace(/[^\u0000-\u007E]/g, function(a){
            return diacriticsMap[a] || a;
        });
    }
}
