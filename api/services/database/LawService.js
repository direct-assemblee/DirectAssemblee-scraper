let DateHelper = require('../helpers/DateHelper.js');

var self = module.exports = {
    findLaw: function(fileUrl) {
        if (fileUrl == undefined) {
            return Promise.reject("No file url for law");
        } else {
            return Law.findOne({
                fileUrl: fileUrl
            });
        }
    },

    insertLaw: function(law) {
        return Law.findOne({
            fileUrl: law.fileUrl
        }).then(foundLaw => {
            if (!foundLaw) {
                let lawToInsert = createLawModel(law);
                return Law.create(lawToInsert).fetch()
            }
        }).catch(err => {
            return self.findLaw(law.fileUrl);
        }).then(law => law.id)
    }
}

let createLawModel = function(law) {
    return {
        fileUrl: law.fileUrl,
        theme: law.theme ? law.theme.id : null,
        originalThemeName: getCamelCaseTheme(law.originalThemeName)
    }
}

let getCamelCaseTheme = function(theme) {
    let originalThemeName = theme;
    if (originalThemeName && originalThemeName.length > 0) {
        originalThemeName = originalThemeName.charAt(0).toUpperCase() + originalThemeName.slice(1);
    }
    return originalThemeName;
}
