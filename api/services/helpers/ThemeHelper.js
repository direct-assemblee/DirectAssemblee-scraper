let Promise = require('bluebird');
let EmailService = require('../EmailService')
let ShortThemeService = require('../database/ShortThemeService');
let SubthemeService = require('../database/SubthemeService');

let shortThemes;
let subthemes;

const REFRESH_PERIOD = 30*60*1000;

module.exports = {
    initThemes: function() {
        refreshShortThemes();
        refreshSubthemes();
        setInterval(refreshShortThemes, REFRESH_PERIOD)
        setInterval(refreshSubthemes, REFRESH_PERIOD)
    },

    findShorterName: function(fullname) {
        for (let i in shortThemes) {
            if (shortThemes[i].fullName.toLowerCase() === fullname.toLowerCase()) {
                return shortThemes[i].shortName;
            }
        }
    },

    findTheme: function(searchedSubTheme) {
        return Promise.filter(subthemes, function(subtheme) {
            return subtheme.name.includes(searchedSubTheme);
        })
        .then(function(foundSubthemes) {
            let theme;
            if (foundSubthemes.length > 0) {
                theme = foundSubthemes[0].theme;
            } else {
                theme = searchedSubTheme;
                EmailService.sendNewSubThemeEmail(searchedSubTheme);
            }
            return theme;
        });
    }
}

let refreshShortThemes = function() {
    return ShortThemeService.findShortThemes()
    .then(function(themes) {
        shortThemes = themes;
    })
}

let refreshSubthemes = function() {
    return SubthemeService.findSubthemes()
    .then(function(themes) {
        subthemes = themes;
    })
}
