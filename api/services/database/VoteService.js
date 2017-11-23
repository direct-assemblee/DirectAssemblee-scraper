let self = module.exports = {
    insertVotes: function(ballotId, votes) {
        return clearVotesForBallot(ballotId)
        .then(function() {
            return Vote.createEach(votes);
        })
    }
}

let clearVotesForBallot = function(ballotId) {
    return Vote.destroy()
    .where({ ballotId: ballotId })
}
