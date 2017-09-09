let DateHelper = require('../helpers/DateHelper.js');

module.exports = {
    insertBallot: function(ballot, shouldUpdate) {
        return Ballot.findOne({
            officialId: ballot.officialId
        }).then(function(foundBallot) {
            if (!foundBallot || shouldUpdate) {
                let ballotToInsert = createBallotModel(ballot)
                if (!foundBallot) {
                    return createBallot(ballotToInsert);
                } else {
                    return updateBallot(foundBallot, ballotToInsert);
                }
            }
        });
    }
}

let createBallotModel = function(ballot) {
    let date = DateHelper.formatDate(ballot.date)
    return {
        'officialId': ballot.officialId,
        'title': ballot.title,
        'theme': ballot.theme,
        'date': date,
        'dateDetailed': ballot.dateDetailed,
        'type': ballot.type,
        'totalVotes': ballot.totalVotes,
        'yesVotes': ballot.yesVotes,
        'noVotes': ballot.noVotes,
        'isAdopted': ballot.isAdopted,
        'analysisUrl': ballot.analysisUrl,
        'fileUrl': ballot.fileUrl
    }
}

let createBallot = function(ballotToInsert) {
    return Ballot.create(ballotToInsert);
}

let updateBallot = function(foundBallot, ballotToUpdate) {
    return Ballot.update({
        id: foundBallot.id
    }, ballotToUpdate)
    .then(function(updatedBallot) {
        return updatedBallot[0];
    })
}
