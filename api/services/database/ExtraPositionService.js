let Promise = require('bluebird');

module.exports = {
    insertExtraPositions: function(extraPositions, deputyId) {
        return clearExtraPositionsForDeputy(deputyId)
        .then(function(removedExtraPositions) {
            let number = removedExtraPositions ? removedExtraPositions.length : 0;
            console.log('removed ' + number + ' extra positions');
            return createExtraPositions(extraPositions, deputyId);
        })
    }
}

let clearExtraPositionsForDeputy = function(deputyId) {
    return ExtraPosition.destroy()
    .where({ deputyId: deputyId });
}

let createExtraPositions = function(extraPositions, deputyId) {
    let promises = [];
    for (let i in extraPositions) {
        let positionToInsert;
        positionToInsert = { position: extraPositions[i].position, office: extraPositions[i].office, type: extraPositions[i].type, deputyId: deputyId };
        promises.push(createExtraPosition(positionToInsert));
    }
    return Promise.all(promises)
}

let createExtraPosition = function(extraPositionToInsert) {
    return ExtraPosition.create(extraPositionToInsert);
}
