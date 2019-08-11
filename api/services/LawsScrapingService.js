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
        }
    })
    .then(function(law) {
        if (law) {
            sendNewThemeEmailIfNeeded(law)
        }
        return law;
    });
}

let retrieveLaw = function(url) {
    return FetchUrlService.retrieveContent(url, LawParser)
    .then(law => {
        if (law) {
            law.fileUrl = url;
            if (law.theme) {
                return findAndHandleTheme(law, false)
            }
        }
        return law;
    })
}

let retrieveThemeFromSenat = function(retrievedLaw) {
    if (retrievedLaw != null && retrievedLaw.urlSenat != null) {
        return FetchUrlService.retrieveContentWithIsoEncoding(retrievedLaw.urlSenat, true, SenatLawParser)
        .then(theme => {
            if (theme != undefined) {
                retrievedLaw.theme = theme;
                return findAndHandleTheme(retrievedLaw, true)
            } else {
                return retrievedLaw;
            }
        })
    } else {
        return retrievedLaw;
    }
}

let findAndHandleTheme = function(law, sendMail) {
    return ThemeHelper.findTheme(law.theme, sendMail)
    .then(function(foundTheme) {
        if (foundTheme) {
            law.theme = foundTheme;
            if (law.themeDetails) {
                law.originalThemeName = law.themeDetail;
            }
        } else {
            law.originalThemeName = law.theme;
            law.theme = null;
        }
        return law;
    })
}

let sendNewThemeEmailIfNeeded = function(law) {
    if (!law.theme) {
        console.log('/!\\ new theme not recognized : ' + law.originalThemeName);
        EmailService.sendNewSubThemeEmail(law.originalThemeName);
    }
    if (law.originalThemeName && law.originalThemeName.length > MAX_THEME_LENGTH) {
        let shortName = ThemeHelper.findShorterName(law.originalThemeName)
        if (!shortName) {
            EmailService.sendSubThemeTooLongEmail(law.originalThemeName);
        }
    }
}
