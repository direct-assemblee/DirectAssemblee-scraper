let Promise = require('bluebird');
let themes = require('../../../assets/themes.json').themes;
let EmailService = require('../EmailService')
let themesShortnames = require('../../../assets/shortThemes.json').themes;

module.exports = {
    findTheme: function(searchedSubTheme) {
        return Promise.filter(themes, function(theme) {
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
    },

    findShorterName: function(fullname) {
        for (let i in themesShortnames) {
            if (themesShortnames[i].fullname === fullname) {
                return themesShortnames[i].shortname;
            }
        }
        return null;
    }
}
