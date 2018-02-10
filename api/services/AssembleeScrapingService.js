'use strict';

let Promise = require('bluebird');

let DeputyService = require('./database/DeputyService.js');
let BallotService = require('./database/BallotService.js');
let VoteService = require('./database/VoteService.js');
let MandateService = require('./database/MandateService.js');
let ExtraPositionService = require('./database/ExtraPositionService.js');
let DeclarationService = require('./database/DeclarationService.js');
let WorkService = require('./database/WorkService.js');
let BallotsScrapingService = require('./BallotsScrapingService');
let DeputiesScrapingService = require('./DeputiesScrapingService');
let DeputyHelper = require('./helpers/DeputyHelper')
let ThemeHelper = require('./helpers/ThemeHelper')
let DeclarationScrapingService = require('./DeclarationScrapingService')

const DEBUG = false;
const RANGE_STEP = 10;

let self = module.exports = {
    startScraping: async function() {
        ThemeHelper.initThemes();

        console.log('==> start classifying unclassified questions');
        await WorkService.classifyUnclassifiedQuestions();

        console.log('==> retrieves declarations urls');
        let allDeputiesUrls = await DeclarationScrapingService.retrieveAllDeputiesDeclarationsUrls();

        console.log('==> start scraping deputies');
        let allDeputies = await DeputiesScrapingService.retrieveDeputiesList();

        let deputies = subArrayIfDebug(allDeputies, 0, RANGE_STEP);

        return retrieveAndInsertDeputiesByRange(allDeputiesUrls, deputies, 0)
        .then(function() {
            console.log('==> start scraping ballots');
            return BallotsScrapingService.retrieveBallotsList()
            .then(function(allBallots) {
                let ballots = subArrayIfDebug(allBallots, 0, RANGE_STEP);
                return retrieveAndInsertBallotsByRange(ballots, 0);
            })
        })
        .then(function() {
            RequestService.sendBallotsUpdateNotif();

            console.log('=> look for non-updated deputies');
            return DeputyService.findNonUpdatedDeputies()
            .then(function(nonUpdatedDeputies) {
                return checkMandatesForNonUpdatedDeputies(nonUpdatedDeputies)
            })
            .then(function() {
                console.log('==> done updating database !!')
                return FetchUrlService.howManyRequest();
            })
        })
    }
}

let subArrayIfDebug = function(array, start, size) {
    if (DEBUG) {
        let subArray = [];
        for (let i = start ; i < start + size ; i++) {
            subArray.push(array[i])
        }
        return subArray;
    } else {
        return array;
    }
}

let retrieveAndInsertDeputiesByRange = function(allDeputiesUrls, deputies, start) {
    let slices = [];
    if (deputies) {
        for (let i = start ; i < deputies.length ; i = i + RANGE_STEP) {
            let end = i + RANGE_STEP;
            if (end > deputies.length) {
                end = deputies.length;
            }
            slices.push(deputies.slice(i, end))
        }
    }
    return retrieveSlicesOfDeputies(allDeputiesUrls, slices);
}

let retrieveSlicesOfDeputies = async function(allDeputiesUrls, slices) {
    for (let i in slices) {
        let start = i * RANGE_STEP;
        let end = start + RANGE_STEP;
        console.log('- retrieving deputies range ' + start + '-' + end);
        await retrieveAndInsertDeputies(allDeputiesUrls, slices[i]);
    }
    return;
}

let retrieveAndInsertDeputies = function(allDeputiesUrls, deputiesRange) {
    return DeputiesScrapingService.retrieveDeputies(allDeputiesUrls, deputiesRange)
    .then(function(deputiesRetrieved) {
        console.log('-- retrieved deputies ' + deputiesRetrieved.length)
        return Promise.mapSeries(deputiesRetrieved, function(deputy) {
            if (deputy) {
                return insertDeputy(deputy)
            }
        })
        .then(function(addedDeputiesIds) {
            return Promise.filter(addedDeputiesIds, function(id) {
                return id; // exists only if works were added
            })
            .then(function(deputiesWithNewWorksIds) {
                return RequestService.sendDeputiesUpdateNotif(deputiesWithNewWorksIds);
            })
        })
    })
}

let insertDeputy = function(deputy) {
    return DeputyService.insertDeputy(deputy, true)
    .then(function() {
        return MandateService.insertMandates(deputy.mandates, deputy.officialId)
    })
    .then(function() {
        console.log('-- inserted mandates for deputy : ' + deputy.lastname);
        return ExtraPositionService.insertExtraPositions(deputy.extraPositions, deputy.officialId);
    })
    .then(function() {
        console.log('-- inserted extra positions for deputy : ' + deputy.lastname);
        return DeclarationService.insertDeclarations(deputy.declarations, deputy.officialId);
    })
    .then(function() {
        console.log('-- inserted declarations for deputy : ' + deputy.lastname);
        if (deputy.works && deputy.works.length > 0) {
            return WorkService.insertWorks(deputy.works, deputy.officialId)
            .then(function() {
                if (deputy.works && deputy.works.length > 0) {
                    console.log('-- inserted works for deputy : ' + deputy.lastname);
                    return deputy.officialId;
                }
                return;
            })
        }
    })
}

let retrieveAndInsertBallotsByRange = async function(ballots, start) {
    let slices = [];
    for (let i = start ; i < ballots.length ; i = i + RANGE_STEP) {
        let end = i + RANGE_STEP;
        if (end > ballots.length) {
            end = ballots.length;
        }
        slices.push(ballots.slice(i, end))
    }
    let deputiesNames = await DeputyService.getDeputiesNames();
    return retrieveSlicesOfBallots(slices, deputiesNames);
}

let retrieveSlicesOfBallots = async function(slices, deputiesNames) {
    for (let i in slices) {
        let start = i * RANGE_STEP;
        let end = start + RANGE_STEP;
        console.log('- retrieving ballots range ' + start + '-' + end);
        await retrieveAndInsertBallots(slices[i], deputiesNames);
    }
    return;
}

let retrieveAndInsertBallots = function(ballotsRange, deputiesNames) {
    return BallotsScrapingService.retrieveBallots(ballotsRange)
    .then(function(ballotsRangeRetrieved) {
        console.log('-- retrieved ballots ' + ballotsRangeRetrieved.length)
        return insertBallots(ballotsRangeRetrieved, 0)
        .then(function() {
            ballotsRangeRetrieved = null;
            return insertVotesForBallots(ballotsRange, deputiesNames);
        })
    })
}

let insertBallots = function(ballots) {
    let promises = [];
    for (let i in ballots) {
        if (ballots[i]) {
            promises.push(BallotService.insertBallot(ballots[i], true));
        }
    }
    ballots = null;
    return Promise.all(promises)
}

let insertVotesForBallots = function(ballots, deputiesNames) {
    let promises = [];
    for (let i in ballots) {
        if (ballots[i]) {
            promises.push(insertVotesForBallot(ballots[i], deputiesNames))
        }
    }
    ballots = null;
    deputiesNames = null;
    return Promise.all(promises);
}

let insertVotesForBallot = async function(ballot, deputies) {
    let votesToInsert = [];
    for (let i in ballot.votes) {
        let vote = ballot.votes[i];
        let deputyId;
        if (vote.deputy.officialId) {
            deputyId = await DeputyService.findDeputyWithOfficialId(vote.deputy.officialId);
        } else {
            deputyId = DeputyHelper.getDeputyIdForVoteInBallot(deputies, vote);
        }
        if (deputyId) {
            votesToInsert.push({ deputyId: deputyId, ballotId: ballot.officialId, value: vote.value });
        }
    }
    ballot.votes = null;
    deputies = null;

    return VoteService.insertVotes(ballot.officialId, votesToInsert)
    .then(function() {
       ballot.nonVoting = findNonVotings(votesToInsert);
       return BallotService.insertBallot(ballot, true);
   })
}

let findNonVotings = function(votes) {
    let count = 0;
    for (let i in votes) {
        if (votes[i].value == 'non-voting') {
            count++;
        }
    }
    votes = null;
    return count;
}

let checkMandatesForNonUpdatedDeputies = async function(nonUpdatedDeputies) {
    if (nonUpdatedDeputies && nonUpdatedDeputies.length > 0) {
        console.log('* ' + nonUpdatedDeputies.length + ' deputies have no new activity - let\'s check their mandate...');
    }
    return Promise.map(nonUpdatedDeputies, function(nonUpdatedDeputy) {
        return DeputiesScrapingService.checkMandate(nonUpdatedDeputy)
        .then(function(doneDeputy) {
            if (doneDeputy && doneDeputy.endOfMandateDate) {
                console.log('* updating deputy ' + doneDeputy.lastname);
                return DeputyService.saveEndOfMandate(doneDeputy)
            }
            return
        })
    }, { concurrency: 10 })
}
