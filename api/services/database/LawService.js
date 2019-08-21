let DateHelper = require('../helpers/DateHelper.js');
let LawTypeService = require('./LawTypeService.js')

var self = module.exports = {
    insertOrUpdateLaw: function(law) {
        return LawTypeService.findLawType(law.typeName)
        .then(foundLawType => {
            return self.findLaw(law.fileUrl)
            .then(foundLaw => {
                let lawToInsert = createLawModel(law, foundLawType);
                if (!foundLaw) {
                    return insertLaw(lawToInsert);
                } else {
                    return updateLaw(lawToInsert);
                }
            })
            .catch(err => {
                console.log(err);
                return;
            })
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

let insertLaw = function(lawToInsert) {
    return Law.create(lawToInsert)
    .catch(err => {
        return self.findLaw(lawToInsert.fileUrl);
    })
}

let updateLaw = function(lawToInsert) {
    return Law.update()
    .where({ fileUrl: lawToInsert.fileUrl })
    .set(lawToInsert)
}

let createLawModel = function(law, foundLawType) {
    return {
        fileUrl: law.fileUrl,
        name: law.name,
        theme: law.theme ? law.theme.id : null,
        lastBallotDate: law.lastBallotDate,
        typeId: foundLawType.id
    }
}

let getCamelCaseTheme = function(theme) {
    let originalThemeName = theme;
    if (originalThemeName && originalThemeName.length > 0) {
        originalThemeName = originalThemeName.charAt(0).toUpperCase() + originalThemeName.slice(1);
    }
    return originalThemeName;
}
