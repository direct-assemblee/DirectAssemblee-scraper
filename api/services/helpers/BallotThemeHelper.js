let Promise = require('bluebird');
let themes = require('../../../assets/themes.json');
let CUSTOM_THEME_ID = '100';

module.exports = {
    CUSTOM_THEME_ID: CUSTOM_THEME_ID,
    
    findTheme: function(searchedSubTheme) {
        return Promise.filter(themes.themes, function(theme) {
            return theme.subthemes.includes(searchedSubTheme);
        })
        .then(function(foundThemes) {
            return foundThemes.length > 0 ? foundThemes[0] :
            {
                id: CUSTOM_THEME_ID,
                name: searchedSubTheme,
                subthemes: []
            }
        });
    }
}
