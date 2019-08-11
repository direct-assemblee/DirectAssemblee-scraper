let DateHelper = require('../helpers/DateHelper.js');
let LawService = require('./LawService.js')

module.exports = {
    insertBallotAndLaw: function(ballot, shouldUpdate) {
        return findOrInsertLaw(ballot)
        .then(function(lawId) {
            console.log("==> inserting ballot with law Id " + lawId)
            return insertBallot(ballot, lawId, shouldUpdate)
        });
    },

    findLastBallotDate: function() {
        return Ballot.find()
        .sort('date DESC')
        .then(function(ballots) {
            if (ballots && ballots.length > 0) {
                return ballots[0].date;
            }
        })
    }
}

let insertBallot = function(ballot, lawId, shouldUpdate) {
    return Ballot.findOne({
        officialId: ballot.officialId
    }).then(function(foundBallot) {
        if (!foundBallot || shouldUpdate) {
            if (!foundBallot) {
                let ballotToInsert = createBallotModel(ballot, lawId)
                return createBallot(ballotToInsert);
            } else {
                let ballotToUpdate = updateBallotModel(ballot, lawId)
                return updateBallot(foundBallot, ballotToUpdate);
            }
        }
    });
}

let findOrInsertLaw = function(ballot) {
    return LawService.findLaw(ballot.fileUrl)
    .then(function(foundLaw) {
        if (!foundLaw) {
            return LawService.insertLaw(ballot);
        } else {
            return foundLaw.id;
        }
    })
    .catch(err => {
        console.log(err);
        return null;
    })
}

let createBallotModel = function(ballot, lawId) {
    let date = DateHelper.findAndFormatDateInString(ballot.date)
    return {
        officialId: ballot.officialId,
        title: ballot.title,
        date: date,
        dateDetailed: ballot.dateDetailed,
        type: ballot.type,
        totalVotes: ballot.totalVotes,
        yesVotes: ballot.yesVotes,
        noVotes: ballot.noVotes,
        isAdopted: ballot.isAdopted,
        analysisUrl: ballot.analysisUrl,
        nonVoting: ballot.nonVoting,
        lawId: lawId
    }
}

let updateBallotModel = function(ballot, lawId) {
    return {
        officialId: ballot.officialId,
        title: ballot.title,
        type: ballot.type,
        totalVotes: ballot.totalVotes,
        yesVotes: ballot.yesVotes,
        noVotes: ballot.noVotes,
        isAdopted: ballot.isAdopted,
        analysisUrl: ballot.analysisUrl,
        nonVoting: ballot.nonVoting,
        lawId: lawId
    }
}

let createBallot = function(ballotToInsert) {
    return Ballot.create(ballotToInsert);
}

let updateBallot = function(foundBallot, ballotToUpdate) {
    return Ballot.update()
    .where({ officialId: foundBallot.officialId })
    .set(ballotToUpdate)
    .then(function() {
        return;
    })
    .catch(err => {
        console.log('Error updating ballot ' + err);
        return
    });
}
