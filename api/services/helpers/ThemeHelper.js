let Promise = require('bluebird');
let themes = require('../../../assets/themes.json');
let EmailService = require('../EmailService')

module.exports = {
    findTheme: function(searchedSubTheme) {
        return Promise.filter(themes.themes, function(theme) {
            return theme.subthemes.includes(searchedSubTheme);
        })
        .then(function(foundThemes) {
            let theme;
            if (foundThemes.length > 0) {
                theme = foundThemes[0];
            } else {
                theme = searchedSubTheme;
                EmailService.sendNewThemeEmail(searchedSubTheme);
            }
            return theme;
        });
    }
}
