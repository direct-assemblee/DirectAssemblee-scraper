let self = module.exports = {
    insertVote: function(vote) {
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

let createVote = function(voteToInsert) {
    return Vote.create(voteToInsert)
    .meta({fetch: true});
}
