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
    clean: function(content) {
        let cleaned = self.removeParentReference(content);
        cleaned = cleaned.replace(/&quot;/g, '\'');
        cleaned = entities.decode(cleaned);
        cleaned = removeSpecialChars(cleaned);
        return cleaned;
    },

    replaceAccents: function(str) {
        return str.replace(/[^\u0000-\u007E]/g, function(a) {
            return diacriticsMap[a] || a;
        });
    },

    removeParentReference: function(str) {
        if (str && str.length > 0) {
            return (' ' + str.trim()).substr(1).trim();
        }
        return str;
    }
}

let removeSpecialChars = function(str) {
    return str.replace(/\.\r\n/g, '[dotspace]')
    .replace(/\s+/g, ' ')
    .replace(/\\n/g, ' ')
    .replace(/\\'/g, '\'')
    .replace(/\x92/g, '\'')
    .replace(/\\'/g, '\'')
    .replace(/\\&/g, '')
    .replace(/\\r/g, '')
    .replace(/\\t/g, '')
    .replace(/\\b/g, '')
    .replace(/\\f/g, '')
    .replace('&quot;', '')
    .replace(/<[^>]*em>/g, '')
    .replace('data-place', 'dataplace')
    .replace(new RegExp('data-url', 'g'), 'dataurl')
    .replace(new RegExp('data-uri-suffix', 'g'), 'dataurisuffix')
    .replace(new RegExp('data-sort', 'g'), 'datasort')
    .replace(/\[dotspace\]/g, '.<br>');
}
