let Promise = require('bluebird');
let LawParser = require('./parsers/LawParser');
let SenatLawParser = require('./parsers/SenatLawParser');
let ThemeHelper = require('./helpers/ThemeHelper');

const MAX_THEME_LENGTH = 55;

let self = module.exports = {
    retrieveLaws: function(urls) {
        let promises = [];
        urls.forEach(url => promises.push(retrieveLawAndTheme(url)))
        return Promise.all(promises)
    }
}

let retrieveLawAndTheme = function(url) {
    return retrieveLaw(url)
    .then(law => {
        if (law && !law.theme) {
            return retrieveThemeFromSenat(law)
        } else {
            return law
        }
    })
}

let retrieveLaw = function(url) {
    return FetchUrlService.retrieveContent(url, LawParser)
    .then(law => {
        if (law) {
            law.fileUrl = url;
            if (law.originalTheme) {
                return findAndHandleTheme(law, false)
            }
        }
        return law;
    })
}

let retrieveThemeFromSenat = function(law) {
    if (law != null && law.urlSenat != null) {
        return FetchUrlService.retrieveContentWithIsoEncoding(law.urlSenat, true, SenatLawParser)
        .then(theme => {
            if (theme != undefined) {
                return findTheme(theme, true)
                .then(foundTheme => {
                    law.theme = foundTheme;
                    return law;
                })
            } else {
                return law;
            }
        })
    } else {
        console.log('/!\\ no link to Senat\'s website : ' + law.name)
        return law;
    }
}

let findAndHandleTheme = function(law, sendMail) {
    return findTheme(law.originalTheme, sendMail)
    .then(function(foundTheme) {
        if (foundTheme) {
            law.theme = foundTheme;
        } else {
            law.theme = null;
        }
        return law;
    })
}

let findTheme = function(searchThemeName, sendMail) {
    return ThemeHelper.findTheme(searchThemeName, sendMail)
}
