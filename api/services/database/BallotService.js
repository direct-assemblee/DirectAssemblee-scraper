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

let createBallot = function(ballotToInsert) {
    return Ballot.create(ballotToInsert);
}

let updateBallot = function(foundBallot, ballotToUpdate) {
    return Ballot.update()
    .where({ officialId: foundBallot.officialId })
    .set(ballotToUpdate);
}
