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
        return law && !law.theme ? retrieveThemeFromSenat(law) : law;
    })
}

let retrieveLaw = function(url) {
    return FetchUrlService.retrieveContent(url, LawParser)
    .then(law => {
        if (law) {
            law.fileUrl = url;
            if (law.originalTheme) {
                return findAndSetThemeToLaw(law.originalTheme, law, false)
                .then(law => {
                    if (law.originalTheme.length > MAX_THEME_LENGTH) {
                        ThemeHelper.sendMailIfNoShortName(law.originalTheme, law.fileUrl)
                    }
                })
            }
        }
        return law;
    })
}

let retrieveThemeFromSenat = function(law) {
    if (law != null && law.urlSenat != null) {
        return FetchUrlService.retrieveContentWithIsoEncoding(law.urlSenat, true, SenatLawParser)
        .then(theme => {
            return theme != undefined ? findAndSetThemeToLaw(theme, law, true) : law;
        })
    } else {
        console.log('/!\\ no link to Senat\'s website : ' + law.name)
        return law;
    }
}

let findAndSetThemeToLaw = function(searchThemeName, law, sendMail) {
    return ThemeHelper.findTheme(searchThemeName, sendMail, law.fileUrl)
    .then(foundTheme => {
        law.theme = foundTheme ? foundTheme : null;
        return law;
    })
}
