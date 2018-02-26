let Promise = require('bluebird');
let ThemeHelper = require('../helpers/ThemeHelper')
let DateHelper = require('../helpers/DateHelper')
let ExtraInfoService = require('./ExtraInfoService')
let DeputyService = require('./DeputyService')

let self = module.exports = {
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

    findWork: function(workId) {
        if (workId) {
            return Work.findOne()
            .where({ id: workId })
        } else {
            return new Promise(function(resolve, reject) {
                resolve()
            })
        }
    },

    findWorkFromUrl: function(workUrl) {
        if (workUrl) {
            return Work.findOne()
            .where({ url: workUrl })
        } else {
            return new Promise(function(resolve, reject) {
                resolve()
            })
        }
    },

    insertWorks: function(works, deputyId) {
        if (works && works.length > 0) {
            let urls = []
            return Promise.filter(works, function(work) {
                let isPast = DateHelper.isPast(work.date)
                let isNew = !urls.includes(work.url)
                if (isPast && isNew) {
                    urls.push(work.url)
                }
                return isPast && isNew
            }, { concurrency: 1 })
            .mapSeries(function(work) {
                let extraToInsert = []
                return createOrUpdateWork(work)
                .then(function(insertedWorkId) {
                    let extras = buildExtraInfosToInsert(insertedWorkId, work, deputyId)
                    return ExtraInfoService.createOrUpdateExtrasInfos(extras)
                    .then(function() {
                        work.id = insertedWorkId
                        return work;
                    })
                })
            }, { concurrency: 1 })
        }
    },

    findLastWorkDate: function(deputyId) {
        return findWorksWithAuthorsAndSubscribers()
        .sort('date DESC')
        .then(function(works) {
            return Promise.filter(works, function(work) {
                return workHasDeputy(work, deputyId)
            })
            .then(function(deputyWorks) {
                if (deputyWorks && deputyWorks.length > 0) {
                    return deputyWorks[0].date;
                }
            })
        })
    }
}

let populateWork = function(workId) {
    return Work.find({ id: workId})
        .populate('authors')
        .populate('participants')
        .then(function(works) {
            return works[0]
        })
}

let findWorksWithAuthorsAndSubscribers = function() {
    return Work.find()
        .populate('authors')
        .populate('participants')
        .sort('date DESC')
}

let workHasDeputy = function(work, deputyId) {
    return workContributorsContainsDeputyId(work.authors, deputyId) || workContributorsContainsDeputyId(work.participants, deputyId)
}

let workContributorsContainsDeputyId = function(contributors, deputyId) {
    let found = false;
    if (contributors && contributors.length) {
        for (let i in contributors) {
            if (contributors[i].officialId == deputyId) {
                found = true;
                break;
            }
        }
    }
    return found;
}

let createOrUpdateWork = function(work) {
    return self.findWorkFromUrl(work.url)
    .then(function(foundWork) {
        let workModel = createBasicWorkModel(work)
        if (foundWork) {
            return updateWork(foundWork, workModel)
        } else {
            return createWork(workModel);
        }
    })
}

let createWork = function(workModel) {
    return Work.create(workModel)
    .meta({ fetch: true })
    .then(function(insertedWork) {
        return insertedWork.id
    })
}

let updateWork = function(work, workUpdate) {
    return Work.update()
    .where({ id: work.id })
    .set(workUpdate)
    .meta({ fetch: true })
    .then(function(insertedWork) {
        return insertedWork[0].id
    })
    .catch(err => {
        console.log('Error updating work ' + err);
        return
    });
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

let buildExtraInfosToInsert = function(insertedWorksId, work, deputyId) {
    let extra = work.extraInfos;
    let extraInfosToInsert = [];
    if (extra && extra.length > 0) {
        for (let j in extra) {
            extraInfosToInsert.push({ info: extra[j].info, value: extra[j].value, workId: insertedWorksId })
        }
    }
    return extraInfosToInsert
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

let createBasicWorkModel = function(work) {
    return {
        title: work.title,
        themeId: work.theme && work.theme.id ? work.theme.id : null,
        tempTheme: work.theme && !work.theme.id ? work.theme : '',
        originalThemeName: work.originalThemeName,
        date: work.date,
        url: work.url,
        description: work.description,
        type: work.type
    }
}
