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

    insertWorks: function(works, deputyId) {
        return clearWorksForDeputy(deputyId)
        .then(function(removedWorks) {
            let number = removedWorks ? removedWorks.length : 0;
            console.log('removed ' + number + ' works');
            return createWorks(works, deputyId)
        })
        .catch(function(err) {
            sails.log.error(err);
            sails.log.debug('============== Inserted works threw an error - keep on going');
        });
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

let clearWorksForDeputy = function(deputyId) {
    return Work.destroy()
    .where({ deputyId: deputyId });
}

let createWorks = function(works, deputyId) {
    let promises = [];
    for (let i in works) {
        promises.push(createWork(deputyId, works[i]));
    }
    return Promise.all(promises)
}

let createWork = function(deputyId, work) {
    let workToInsert = createWorkModel(deputyId, work)
    return Work.create(workToInsert)
}

let createWorkModel = function(deputyId, work) {
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
