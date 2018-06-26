let Promise = require('bluebird');

module.exports = {
    insertExtraPosition: function(extraPosition, deputyId) {
        return clearExtraPositionsForDeputy(deputyId)
        .then(function() {
            return createExtraPosition(extraPosition, deputyId);
        })
    }
}

let clearExtraPositionsForDeputy = function(deputyId) {
    return ExtraPosition.destroy()
    .where({ deputyId: deputyId });
}

let createExtraPosition = function(extraPosition, deputyId) {
    let positionToInsert = { position: extraPosition.position, deputyId: deputyId };
    return ExtraPosition.create(positionToInsert)
}
