let Promise = require('bluebird');
let EmailService = require('../EmailService')
let ShortThemeService = require('../database/ShortThemeService');
let SubthemeService = require('../database/SubthemeService');

let shortThemes;
let subthemes;

const REFRESH_PERIOD = 30*60*1000;

let self = module.exports = {
    initThemes: function() {
        refreshShortThemes();
        refreshSubthemes();
        setInterval(refreshShortThemes, REFRESH_PERIOD)
        setInterval(refreshSubthemes, REFRESH_PERIOD)
    },

    sendMailIfNoShortName: function(searchedSubTheme, url) {
        var shortNameFound = false;
        for (let i in shortThemes) {
            if (shortThemes[i].fullName.toLowerCase() === searchedSubTheme.toLowerCase()) {
                shortNameFound = true;
                break;
            }
        }
        if (!shortNameFound) {
            EmailService.sendSubThemeTooLongEmail(searchedSubTheme, url);
        }
    },

    findTheme: function(searchedSubTheme, fixAndSendMail) {
        return self.findSubtheme(searchedSubTheme, fixAndSendMail)
        .then(subtheme => subtheme.theme != null ? subtheme.theme : subtheme)
    },

    findSubtheme: function(searchedSubTheme, fixAndSendMail, itemUrl) {
        return Promise.filter(subthemes, subtheme => {
            return subtheme.name.includes(searchedSubTheme);
        })
        .then(foundSubthemes => {
            let subtheme;
            if (foundSubthemes.length > 0) {
                subtheme = foundSubthemes[0];
                for (i in foundSubthemes) {
                    if (searchedSubTheme == foundSubthemes[i].name) {
                        theme = foundSubthemes[i];
                    }
                }
            } else if (fixAndSendMail) {
                EmailService.sendNewSubThemeEmail(searchedSubTheme, itemUrl);
            }
            return subtheme;
        });
    }
}

let refreshShortThemes = function() {
    return ShortThemeService.findShortThemes()
    .then(themes => {
        shortThemes = themes;
    })
}

let refreshSubthemes = function() {
    return SubthemeService.findSubthemes()
    .then(themes => {
        subthemes = themes;
    })
}
