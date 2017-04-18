var Promise = require("bluebird");
var DateHelper = require('../helpers/DateHelper.js');

module.exports = {
  insertBallot: function(ballot, shouldUpdate) {
    return Ballot.findOne({
      officialId: ballot.id
    }).then(function(foundBallot) {
      if (!foundBallot || shouldUpdate) {
        var ballotToInsert = createBallotModel(ballot)
        if (!foundBallot) {
          return createBallot(ballotToInsert);
        } else {
          return updateBallot(ballotToInsert);
        }
      }
    });
  }
}

var createBallotModel = function(ballot) {
  var date = DateHelper.formatDate(ballot.date)
  return {
    "officialId": ballot.id,
    "title": ballot.title,
    "theme": ballot.theme,
    "date": date,
    "dateDetailed": ballot.dateDetailed,
    "type": ballot.type,
    "totalVotes": ballot.totalVotes,
    "yesVotes": ballot.yesVotes,
    "noVotes": ballot.noVotes,
    "analysisUrl": ballot.analysisUrl,
    "fileUrl": ballot.fileUrl,
  }
}

var createBallot = function(ballotToInsert) {
  return Ballot.create(ballotToInsert)
    .then(function(insertedBallot) {
      // console.log("created ballot : " + insertedBallot.officialId);
      return insertedBallot;
    })
}

var updateBallot = function(ballotToUpdate) {
  return Ballot.update({
    officialId: ballotToUpdate.officialId
  }, ballotToUpdate)
  .then(function(updatedBallot) {
    // console.log("updated ballot : " + updatedBallot[0].officialId);
    return updatedBallot[0];
  })
}
