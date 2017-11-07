let self = module.exports = {
    insertVote: function(vote) {
        return self.findDeputyVoteForBallot(vote.deputyId, vote.ballotId)
        .then(function(foundVote) {
            if (!foundVote) {
                return createVote(vote);
            }
        })
    },

    findDeputyVoteForBallot: function(deputyId, ballotId) {
        return Vote.findOne()
        .where({ deputyId: deputyId, ballotId: ballotId });
    },

    findVotesWithValueForBallot: function(ballotId, value) {
        return Vote.find()
        .where({ ballotId: ballotId , value: value })
    }
}

let createVote = function(voteToInsert) {
    return Vote.create(voteToInsert);
}
