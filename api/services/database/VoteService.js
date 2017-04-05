var Promise = require("bluebird");

var createVoteModel = function(vote) {
  return Depute.findOne({
    id: vote.deputeId
  })
  .then(function(depute) {
    return Law.findOne({
      officialId: vote.lawId
    })
    .then(function(law) {
      return {
        "value": vote.value,
        "deputeId": depute.id,
        "lawId": law.id
      }
    })
  })
}

var createVote = function(voteToInsert) {
  return Vote.create(voteToInsert)
  .then(function(insertedVote) {
    // console.log("created vote : " + insertedVote.value + " from " + insertedVote.deputeId + " for " + insertedVote.lawId);
    return insertedVote;
  });
}

self = module.exports = {
  insertVote: function(vote, callback) {
    return self.findDeputeVoteForLaw(vote.deputeId, vote.lawId)
    .then(function(foundVote) {
      if (!foundVote) {
        return createVoteModel(vote)
        .then(function(voteToInsert) {
          return createVote(voteToInsert);
        })
      } else {
        return;
      }
    })
  },

  findDeputeVoteForLaw: function(deputeId, lawId) {
    return Vote.findOne()
		.where({ deputeId: deputeId, lawId: lawId });
  }
}
