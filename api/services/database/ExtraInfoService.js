let Promise = require('bluebird');

module.exports = {
    clearExtraPositionsForWorks: function(workIds) {
        let promises = [];
        for (let i in workIds) {
            promises.push(clearExtraPositionsForWork[workIds[i]]);
        }
        return Promise.all(promises);
    },

    insertExtraInfos: function(extraInfosArray, workIds) {
        let extraInfosToInsert = [];
        for (let i in workIds) {
            for (let j in extraInfosArray[i]) {
                extraInfosToInsert.push({ info: extraInfosArray[i][j].info, value: extraInfosArray[i][j].value, workId: workIds[i] });
            }
        }
        return ExtraInfo.create(extraInfosToInsert);
    }
}

let clearExtraPositionsForWork = function(workId) {
    return ExtraInfo.destroy()
    .where({ workId: workId });
}

let createExtraInfos = function(extraInfos, workId) {
    let promises = [];
    for (let i in extraInfos) {
        let infoToInsert = { info: extraInfos[i].info, value: extraInfos[i].value, workId: workId };
        promises.push(createExtraInfo(infoToInsert));
    }
    return Promise.all(promises)
}

let createExtraInfo = function(infoToInsert) {
    return ExtraInfo.create(infoToInsert)
    .meta({fetch: true})
    .then(function(createdExtraInfo) {
        return createdExtraInfo;
    });
}
