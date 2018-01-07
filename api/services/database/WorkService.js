let Promise = require('bluebird');
let ThemeHelper = require('../helpers/ThemeHelper')
let DateHelper = require('../helpers/DateHelper')
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

    insertWorks: function(works, deputyId) {
        if (works && works.length > 0) {
            let olderWorkDate = getOlderWorkDate(works)
            return clearWorksForDeputyAfterDate(deputyId, olderWorkDate)
            .then(function() {
                let worksToInsert = [];
                for (let i in works) {
                    worksToInsert.push(createWorkModel(works[i], deputyId));
                }
                return insertWorksWithExtraInfos(worksToInsert, works, deputyId);
            })
        }
    },

    findLastWorkDate: function(deputyId) {
        return Work.find()
        .where({ deputyId: deputyId })
        .sort('date DESC')
        .then(function(works) {
            if (works && works.length > 0) {
                return works[0].date;
            }
        })
    }
}

let clearWorksForDeputyAfterDate = function(deputyId, afterDate) {
    let options = {
        deputyId: deputyId ,
        date: { '>': afterDate }
    }
    return Work.destroy()
    .where(options);
}

let getOlderWorkDate = function(works) {
    if (works && works.length > 0) {
        works.sort(function(a, b) {
            var diff = DateHelper.getDiffInDays(a.date, b.date)
            return diff == 0 ? 0 : diff > 0 ? 1 : -1
        });
        return works[0].date
    }
}

let insertWorksWithExtraInfos = function(worksToInsert, works, deputyId) {
    let extraInfosToInsert = [];
    return Work.createEach(worksToInsert)
    .meta({fetch: true})
    .then(function(insertedWorks) {
        let promises = [];
        let workIds = [];
        for (let i in insertedWorks) {
            let extra = works[i].extraInfos;
            if (extra && extra.length > 0) {
                workIds.push(insertedWorks[i].id)
                for (let j in extra) {
                    extraInfosToInsert.push({ info: extra[j].info, value: extra[j].value, workId: insertedWorks[i].id })
                }
            }
        }
        return ExtraInfoService.clearExtraInfosForWorks(workIds)
        .then(function() {
            return ExtraInfoService.insertAllExtraInfos(extraInfosToInsert);
        });
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
        originalThemeName: work.originalThemeName,
        date: work.date,
        url: work.url,
        description: work.description,
        deputyId: deputyId,
        type: work.type
    }
}
