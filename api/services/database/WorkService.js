let Promise = require('bluebird');
let ThemeHelper = require('../helpers/ThemeHelper')

module.exports = {
    classifyUnclassifiedQuestions: function() {
        return findUnclassifiedQuestions()
        .then(function(unclassifiedQuestions) {
            return Promise.map(unclassifiedQuestions, function(question) {
                return ThemeHelper.findTheme(question.tempTheme)
                .then(function(foundTheme) {
                    if (foundTheme) {
                        question.theme = foundTheme;
                        question.tempTheme = null;
                        return saveWork(question);
                    } else {
                        console.log('/!\\ new theme not recognized : ' + question.theme);
                        return question;
                    }
                })
            })
        })
    },

    clearWorksForDeputy: function(deputyId) {
        return Work.destroy()
        .where({ deputyId: deputyId });
    },

    insertWork: function(work, deputyId) {
        let workToInsert = createWorkModel(work, deputyId)
        return Work.create(workToInsert)
    }
}

let findUnclassifiedQuestions = function() {
    return Work.find()
    .where({ type: 'question', temptheme: {'!': null} })
}

let saveWork = function(work) {
    return Work.update({
        id: work.id
    }, work)
    .then(function(updatedWork) {
        return updatedWork[0];
    })
}

let createWorkModel = function(work, deputyId) {
    let id;
    if (typeof work.id === 'number') {
        id = work.id;
    }
    return {
        'title': work.title,
        'themeId': work.theme && work.theme.id ? work.theme.id : null,
        'tempTheme': work.theme && !work.theme.id ? work.theme : null,
        'date': work.date,
        'url': work.url,
        'officialId': id,
        'description': work.description,
        'deputyId': deputyId,
        'type': work.type
    }
}
