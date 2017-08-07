var Promise = require("bluebird");
var DateHelper = require('../helpers/DateHelper.js');

module.exports = {
    insertWorks: function(works, deputyId) {
        return clearWorksForDeputy(deputyId)
        .then(function(removedWorks) {
            return createWorks(works, deputyId)
        })
        .catch(function(err) {
            sails.log.error(err);
            sails.log.debug("============== Inserted works threw an error - keep on going");
        });
    }
}

var clearWorksForDeputy = function(deputyId) {
    return Work.destroy()
    .where({ deputyId: deputyId });
}

var createWorks = function(works, deputyId) {
    var promises = [];
    for (i in works) {
        promises.push(createWork(deputyId, works[i]));
    }
    return Promise.all(promises)
}

var createWork = function(deputyId, work) {
    var workToInsert = createWorkModel(deputyId, work)
    return Work.create(workToInsert)
}

var createWorkModel = function(deputyId, work) {
    var id;
    if (typeof work.id === "number") {
        id = work.id;
    }
    return {
        "title": work.title,
        "theme": work.theme,
        "date": work.date,
        "url": work.url,
        "officialId": id,
        "description": work.description,
        "deputyId": deputyId,
        "type": work.type
    }
}
