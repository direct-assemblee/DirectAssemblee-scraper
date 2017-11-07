let Promise = require('bluebird');
let ThemeHelper = require('../helpers/ThemeHelper')
let ExtraInfoService = require('./ExtraInfoService')

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
        .where({ deputyId: deputyId })
        .meta({fetch: true})
        .then(function(destroyedWorks) {
            let workIds = [];
            for (let i in destroyedWorks) {
                workIds.push(destroyedWorks[i].id);
            }
            return ExtraInfoService.clearExtraInfosForWorks(destroyedWorks);
        });
    },

    insertWorks: function(works, deputyId) {
        if (works && works.length > 0) {
            let promises = [];
            for (let i in works) {
                promises.push(insertWorkWithExtraInfos(works[i], deputyId))
            }
            return Promise.all(promises);
        }
    }
}

let insertWorkWithExtraInfos = function(work, deputyId) {
    let workToInsert = createWorkModel(work, deputyId)
    return Work.create(workToInsert)
    .meta({fetch: true})
    .then(function(insertedWork) {
        if (work.extraInfos && work.extraInfos.length > 0) {
            return ExtraInfoService.insertExtraInfos(insertedWork.id, work.extraInfos)
        }
        return;
    })
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
