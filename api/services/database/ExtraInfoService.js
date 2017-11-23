let Promise = require('bluebird');

module.exports = {
    clearExtraInfosForWorks: function(workIds) {
        let promises = [];
        for (let i in workIds) {
            promises.push(clearExtraInfosForWork[workIds[i]]);
        }
        return Promise.all(promises);
    },

    insertAllExtraInfos: function(extraInfosToInsert) {
        return ExtraInfo.createEach(extraInfosToInsert);
    }
}

let clearExtraInfosForWork = function(workId) {
    return ExtraInfo.destroy()
    .where({ workId: workId });
}
