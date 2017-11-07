let DateHelper = require('../helpers/DateHelper.js');

module.exports = {
    insertBallot: function(ballot, shouldUpdate, returnInserted) {
        return Ballot.findOne({
            officialId: ballot.officialId
        }).then(function(foundBallot) {
            if (!foundBallot || shouldUpdate) {
                let ballotToInsert = createBallotModel(ballot)
                if (!foundBallot) {
                    return createBallot(ballotToInsert, returnInserted);
                } else {
                    return updateBallot(foundBallot, ballotToInsert, returnInserted);
                }
            }
        });
    }
}

let createBallotModel = function(ballot) {
    let date = DateHelper.findAndFormatDateInString(ballot.date)
    return {
        officialId: ballot.officialId,
        title: ballot.title,
        themeId: ballot.theme ? ballot.theme.id : null,
        date: date,
        dateDetailed: ballot.dateDetailed,
        type: ballot.type,
        totalVotes: ballot.totalVotes,
        yesVotes: ballot.yesVotes,
        noVotes: ballot.noVotes,
        isAdopted: ballot.isAdopted,
        analysisUrl: ballot.analysisUrl,
        fileUrl: ballot.fileUrl,
        nonVoting: ballot.nonVoting
    }
}

let createBallot = function(ballotToInsert, returnInserted) {
    return Ballot.create(ballotToInsert)
    .meta({fetch: returnInserted});
}

let updateBallot = function(foundBallot, ballotToUpdate, returnInserted) {
    return Ballot.update()
    .where({ id: foundBallot.id })
    .set(ballotToUpdate)
    .meta({fetch: returnInserted})
    .then(function(updatedBallots) {
        if (returnInserted) {
            return updatedBallots[0];
        }
    });
}
