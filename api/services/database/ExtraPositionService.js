var Promise = require("bluebird");

var self = module.exports = {
  insertExtraPositions: function(extraPositions, deputyId) {
    return clearExtraPositionsForDeputy(deputyId)
    .then(function(removedMandates) {
      return createExtraPositions(extraPositions, deputyId);
    })
  }
}

var clearExtraPositionsForDeputy = function(deputyId) {
  return ExtraPosition.destroy()
    .where({ deputyId: deputyId });
}

var createExtraPositions = function(extraPositions, deputyId) {
  var promises = [];
  for (i in extraPositions) {
    var positionToInsert;
    if (extraPositions[i].bureau) {
      positionToInsert = { name: extraPositions[i].bureau, type: 'bureau', deputyId: deputyId };
    } else {
      positionToInsert = { name: extraPositions[i].commission, type: 'commission', deputyId: deputyId };
    }
    promises.push(createExtraPosition(positionToInsert));
  }
  return Promise.all(promises)
}

var createExtraPosition = function(extraPositionToInsert) {
  return ExtraPosition.create(extraPositionToInsert)
  .then(function(insertedExtraPosition) {
    console.log("created extra position : " + insertedExtraPosition.text + " for " + insertedExtraPosition.deputyId);
    return insertedExtraPosition;
  });
}
