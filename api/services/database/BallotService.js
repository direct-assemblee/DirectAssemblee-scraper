let Promise = require('bluebird')
let DateHelper = require('../helpers/DateHelper.js')

module.exports = {
    insertBallot: function(ballot, shouldUpdate) {
        return Ballot.findOne({
            officialId: ballot.officialId,
        }).then(function(foundBallot) {
            if (!foundBallot || shouldUpdate) {
                let ballotToInsert = createBallotModel(ballot)
                if (!foundBallot) {
                    return createBallot(ballotToInsert)
                } else {
                    return updateBallot(foundBallot, ballotToInsert)
                }
            }
        })
    },
}

var createBallotModel = function(ballot) {
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
        'fileUrl': ballot.fileUrl,
    }
}

var createBallot = function(ballotToInsert) {
    return Ballot.create(ballotToInsert)
        .then(function(insertedBallot) {
        // console.log('created ballot : ' + insertedBallot.officialId + ' of type : ' + insertedBallot.type);
            return insertedBallot
        })
}

var updateBallot = function(foundBallot, ballotToUpdate) {
    return Ballot.update({
        id: foundBallot.id,
    }, ballotToUpdate)
        .then(function(updatedBallot) {
        // console.log('updated ballot : ' + updatedBallot[0].officialId + ' of type : ' + updatedBallot[0].type);
            return updatedBallot[0]
        })
}
