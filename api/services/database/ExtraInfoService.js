let Promise = require('bluebird');

module.exports = {
    insertExtraInfos: function(extraInfos, workId) {
        return clearExtraPositionsForWork(workId)
        .then(function(removedExtraInfos) {
            let number = removedExtraInfos ? removedExtraInfos.length : 0;
            // console.log('removed ' + number + ' extra infos');
            return createExtraInfos(extraInfos, workId);
        })
    }
}

let clearExtraPositionsForWork = function(workId) {
    return ExtraInfo.destroy()
    .where({ workId: workId });
}

let createExtraInfos = function(extraInfos, workId) {
    let promises = [];
    for (let i in extraInfos) {
        let infoToInsert = { label: extraInfos[i].label, text: extraInfos[i].text, workId: workId };
        promises.push(createExtraInfo(infoToInsert));
    }
    return Promise.all(promises)
}

let createExtraInfo = function(infoToInsert) {
    return ExtraInfo.create(infoToInsert);
}
