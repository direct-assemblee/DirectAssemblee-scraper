let Promise = require('bluebird');
let LawParser = require('./parsers/LawParser');
let ThemeHelper = require('./helpers/ThemeHelper');

let self = module.exports = {
    retrieveLaws: function(urls) {
        let promises = [];
        urls.forEach(url => promises.push(retrieveLaw(url)))
        return Promise.all(promises)
    }
}

let retrieveLaw = function(url) {
    return FetchUrlService.retrieveContent(url, LawParser)
    .then(law => {
        if (law) {
            law.fileUrl = url;
            if (law.theme != undefined) {
                return ThemeHelper.findTheme(law.originalThemeName)
                .then(function(foundTheme) {
                    if (foundTheme) {
                        law.theme = foundTheme;
                    } else {
                        console.log('/!\\ new theme not recognized : ' + parsedTheme);
                    }
                    return law;
                })
            }
        }
        return law;
    })
}
