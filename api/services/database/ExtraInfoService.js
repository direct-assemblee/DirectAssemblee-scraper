let Promise = require('bluebird');

module.exports = {
    clearExtraInfosForWorks: function(workIds) {
        return ExtraInfo.destroy()
        .where({ workId: workIds });
    },

    insertAllExtraInfos: function(extraInfosToInsert) {
        return ExtraInfo.createEach(extraInfosToInsert);
    }
}
