var Promise = require("bluebird");

var self = module.exports = {
  insertVote: function(vote, callback) {
    return self.findDeputeVoteForBallot(vote.deputyId, vote.ballotId)
    .then(function(foundVote) {
      if (!foundVote) {
        return createVote(vote);
      }
    })
  },

  findDeputeVoteForBallot: function(deputyId, ballotId) {
    return Vote.findOne()
		.where({ deputyId: deputyId, ballotId: ballotId });
  }
}

var createVote = function(voteToInsert) {
  return Vote.create(voteToInsert)
  .then(function(insertedVote) {
    // console.log("created vote : " + insertedVote.value + " from " + insertedVote.deputyId + " for " + insertedVote.ballotId);
    return insertedVote;
  });
}
