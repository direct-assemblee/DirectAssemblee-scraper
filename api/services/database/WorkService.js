let Promise = require('bluebird');
let ThemeHelper = require('../helpers/ThemeHelper')
let DateHelper = require('../helpers/DateHelper')
let WorkTypeHelper = require('../helpers/WorkTypeHelper')
let ExtraInfoService = require('./ExtraInfoService')
let DeputyService = require('./DeputyService')
let WorkSubtypeService = require('./WorkSubtypeService.js')

let self = module.exports = {
    classifyUnclassifiedQuestions: function() {
        return findUnclassifiedQuestions()
        .then(function(unclassifiedQuestions) {
            return Promise.map(unclassifiedQuestions, function(question) {
                return ThemeHelper.findSubtheme(question.unclassifiedTemporaryTheme)
                .then(function(foundSubtheme) {
                    if (foundSubtheme) {
                        question.subthemeId = foundSubtheme.id;
                        question.unclassifiedTemporaryTheme = '';
                        return saveWork(Object.assign({}, question));
                    } else {
                        console.log('UNCLASSIFIED /!\\ new theme not recognized : ' + question.theme);
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
                return getInsertSubtypeId(work.subtype)
                .then(subtypeId => {
                    work.subtypeId = subtypeId
                    return insertWork(work, deputyId)
                })
            }, { concurrency: 1 })
        }
    },

    findLastWorkDate: function(allWorks, deputyId) {
        return Promise.filter(allWorks, function(work) {
            return workHasDeputy(work, deputyId)
        })
        .then(function(deputyWorks) {
            if (deputyWorks && deputyWorks.length > 0) {
                return deputyWorks[0].date;
            }
        })
    },

    findWorksWithAuthorsAndSubscribers: function() {
        return Work.find()
            .populate('authors')
            .populate('participants')
            .sort('date DESC')
    }
}

let getInsertSubtypeId = function(subtype) {
    return WorkSubtypeService.insertWorkSubtype(subtype)
    .then(() => {
        return WorkSubtypeService.findWorkSubtype(subtype.name)
        .then(subtype => {
            return subtype.id
        })
    })
}

let insertWork = function(work, deputyId) {
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
}

let populateWork = function(workId) {
    return Work.find({ id: workId})
        .populate('authors')
        .populate('participants')
        .then(function(works) {
            return works[0]
        })
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
    let questionId = WorkTypeHelper.getWorkTypeId(WorkTypeHelper.WORK_OFFICIAL_PATH_QUESTIONS)
    return Work.find()
    .where({ unclassifiedTemporaryTheme: {'!=': ''} })
    .populate('subtypeId')
    .then(function(works) {
        return Promise.filter(works, function(work) {
            return WorkTypeHelper.getWorkTypeId(work.subtype.parentTypeId)
            return work.subtype.parentType.id == questionId
        })
    })
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
        subthemeId: work.subtheme && work.subtheme.id ? work.subtheme.id : null,
        unclassifiedTemporaryTheme: work.subtheme && !work.subtheme.id ? work.subtheme : '',
        date: work.date,
        url: work.url,
        description: work.description,
        subtypeId: work.subtypeId,
        unclassifiedTemporaryTheme: work.unclassifiedTemporaryTheme
    }
}
