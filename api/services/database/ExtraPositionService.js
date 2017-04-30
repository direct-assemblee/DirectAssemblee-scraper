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
    positionToInsert = { position: extraPositions[i].position, office: extraPositions[i].office, type: extraPositions[i].type, deputyId: deputyId };
    promises.push(createExtraPosition(positionToInsert));
  }
  return Promise.all(promises)
}

var createExtraPosition = function(extraPositionToInsert) {
  return ExtraPosition.create(extraPositionToInsert)
  .then(function(insertedExtraPosition) {
    // console.log("created extra position : " + insertedExtraPosition.position + " - " + insertedExtraPosition.office + " for " + insertedExtraPosition.deputyId);
    return insertedExtraPosition;
  });
}
