let Promise = require('bluebird');

module.exports = {
    createOrUpdateExtrasInfos: function(extraInfosToInsert) {
        return Promise.mapSeries(extraInfosToInsert, function(extraInfo) {
            return findExtraInfos(extraInfo)
            .then(function(foundExtraInfo) {
                if (foundExtraInfo) {
                    return updateExtraInfo(foundExtraInfo, extraInfo)
                } else {
                    return createExtraInfo(extraInfo)
                }
            })
        })
    }
}

let findExtraInfos = function(extraInfo) {
    return ExtraInfo.findOne()
    .where({ info: extraInfo.info, workId: extraInfo.workId })
}

let createExtraInfo = function(extraInfo) {
    return ExtraInfo.create(extraInfo)
}

let updateExtraInfo = function(foundExtraInfo, extraInfo) {
    return ExtraInfo.update()
    .where({ id: foundExtraInfo.id })
    .set(extraInfo)
}
