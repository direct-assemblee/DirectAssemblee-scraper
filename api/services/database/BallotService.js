let DateHelper = require('../helpers/DateHelper.js');

module.exports = {
    insertBallot: function(ballot, shouldUpdate) {
        return Ballot.findOne({
            officialId: ballot.officialId
        }).then(function(foundBallot) {
            if (!foundBallot || shouldUpdate) {
                if (!foundBallot) {
                    let ballotToInsert = createBallotModel(ballot)
                    return createBallot(ballotToInsert);
                } else {
                    let ballotToUpdate = updateBallotModel(ballot)
                    return updateBallot(foundBallot, ballotToUpdate);
                }
            }
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

let createBallotModel = function(ballot) {
    let date = DateHelper.findAndFormatDateInString(ballot.date)
    let originalThemeName = ballot.originalThemeName;
    if (originalThemeName && originalThemeName.length > 0) {
        originalThemeName = originalThemeName.charAt(0).toUpperCase() + originalThemeName.slice(1);
    }
    return {
        officialId: ballot.officialId,
        title: ballot.title,
        themeId: ballot.theme ? ballot.theme.id : null,
        originalThemeName: originalThemeName,
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

let updateBallotModel = function(ballot) {
    let originalThemeName = ballot.originalThemeName;
    if (originalThemeName && originalThemeName.length > 0) {
        originalThemeName = originalThemeName.charAt(0).toUpperCase() + originalThemeName.slice(1);
    }
    return {
        officialId: ballot.officialId,
        title: ballot.title,
        themeId: ballot.theme ? ballot.theme.id : null,
        originalThemeName: originalThemeName,
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
