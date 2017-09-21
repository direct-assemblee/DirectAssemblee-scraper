let Promise = require('bluebird');

module.exports = {
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
