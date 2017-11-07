let Promise = require('bluebird');

module.exports = {
    clearExtraInfosForWorks: function(workIds) {
        let promises = [];
        for (let i in workIds) {
            promises.push(clearExtraInfosForWork[workIds[i]]);
        }
        return Promise.all(promises);
    },

    insertExtraInfos: function(workId, extraInfos) {
        let extraInfosToInsert = [];
        for (let i in extraInfos) {
            extraInfosToInsert.push({ info: extraInfos[i].info, value: extraInfos[i].value, workId: workId });
        }
        return ExtraInfo.createEach(extraInfosToInsert);
    }
}

let clearExtraInfosForWork = function(workId) {
    return ExtraInfo.destroy()
    .where({ workId: workId });
}
