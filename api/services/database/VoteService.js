let self = module.exports = {
    insertVotes: function(ballotId, votes) {
        return clearVotesForBallot(ballotId)
        .then(function() {
            return Vote.createEach(votes);
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

let clearVotesForBallot = function(ballotId) {
    return Vote.destroy()
    .where({ ballotId: ballotId })
}
