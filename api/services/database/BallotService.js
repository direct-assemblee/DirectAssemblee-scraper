var Promise = require("bluebird");
var DateHelper = require('../helpers/DateHelper.js');

module.exports = {
  insertBallot: function(ballot, shouldUpdate) {
    return Ballot.findOne({
      officialId: ballot.officialId
    }).then(function(foundBallot) {
      if (!foundBallot || shouldUpdate) {
        var ballotToInsert = createBallotModel(ballot)
        if (!foundBallot) {
          return createBallot(ballotToInsert);
        } else {
          return updateBallot(foundBallot, ballotToInsert);
        }
      }
    });
  }
}

var createBallotModel = function(ballot) {
  var date = DateHelper.formatDate(ballot.date)
  return {
    "officialId": ballot.officialId,
    "title": ballot.title,
    "theme": ballot.theme,
    "date": date,
    "dateDetailed": ballot.dateDetailed,
    "type": ballot.type,
    "totalVotes": ballot.totalVotes,
    "yesVotes": ballot.yesVotes,
    "noVotes": ballot.noVotes,
    "isAdopted": ballot.isAdopted,
    "analysisUrl": ballot.analysisUrl,
    "fileUrl": ballot.fileUrl
  }
}

var createBallot = function(ballotToInsert) {
  return Ballot.create(ballotToInsert)
    .then(function(insertedBallot) {
      // console.log("created ballot : " + insertedBallot.officialId);
      return insertedBallot;
    })
}

var updateBallot = function(foundBallot, ballotToUpdate) {
  return Ballot.update({
    id: foundBallot.id
  }, ballotToUpdate)
  .then(function(updatedBallot) {
    // console.log("updated ballot : " + updatedBallot[0].officialId);
    return updatedBallot[0];
  })
}
