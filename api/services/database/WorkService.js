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
                        question.themeId = foundTheme.id;
                        question.tempTheme = '';
                        return saveWork(Object.assign({}, question));
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
        .then(function() {
            return true;
        });
    },

    insertWorks: function(works, deputyId) {
        if (works && works.length > 0) {
            let worksToInsert = [];
            for (let i in works) {
                worksToInsert.push(createWorkModel(works[i], deputyId))
            }
            return Work.createEach(worksToInsert);
        }
    }
}

let findUnclassifiedQuestions = function() {
    return Work.find()
    .where({ type: 'question', tempTheme: {'!=': ''} })
}

let saveWork = function(work) {
    return Work.update()
    .where({
        id: work.id
    })
    .set(work)
    .then(function() {
        return;
    })
    .catch(err => {
        console.log('Error saving works ' + err);
        return
    });
}

let createWorkModel = function(work, deputyId) {
    let id;
    if (typeof work.id === 'number') {
        id = work.id;
    }
    return {
        title: work.title,
        themeId: work.theme && work.theme.id ? work.theme.id : null,
        tempTheme: work.theme && !work.theme.id ? work.theme : '',
        date: work.date,
        url: work.url,
        description: work.description,
        deputyId: deputyId,
        type: work.type
    }
}
