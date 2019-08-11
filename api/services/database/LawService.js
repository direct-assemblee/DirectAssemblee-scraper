let DateHelper = require('../helpers/DateHelper.js');

var self = module.exports = {
    insertOrUpdateLaw: function(law) {
        return self.findLaw(law.fileUrl)
        .then(function(foundLaw) {
            if (!foundLaw) {
                return insertLaw(law);
            } else {
                return updateLaw(law);
            }
        })
        .catch(err => {
            console.log(err);
            return;
        })
    },

    findLaw: function(fileUrl) {
        if (fileUrl == undefined) {
            return Promise.reject("No file url for law ");
        } else {
            return Law.findOne({
                fileUrl: fileUrl
            });
        }
    },

    updateDate: function(law) {
        return Law.update()
        .where({ fileUrl: law.fileUrl })
        .set({ lastBallotDate: DateHelper.findAndFormatDateInString(law.date) })
        .catch(err => {
            console.log('Error updating law ' + err);
            return
        });
    }
}

let insertLaw = function(law) {
    let lawToInsert = createLawModel(law);
    return Law.create(lawToInsert)
    .catch(err => {
        return self.findLaw(law.fileUrl);
    })
}

let updateLaw = function(law) {
    let lawToInsert = createLawModel(law);
    return Law.update()
    .where({ fileUrl: law.fileUrl })
    .set(lawToInsert)
}

let createLawModel = function(law) {
    return {
        fileUrl: law.fileUrl,
        title: law.title,
        theme: law.theme ? law.theme.id : null,
        originalThemeName: getCamelCaseTheme(law.originalThemeName),
        lastBallotDate: law.lastBallotDate
    }
}

let getCamelCaseTheme = function(theme) {
    let originalThemeName = theme;
    if (originalThemeName && originalThemeName.length > 0) {
        originalThemeName = originalThemeName.charAt(0).toUpperCase() + originalThemeName.slice(1);
    }
    return originalThemeName;
}
