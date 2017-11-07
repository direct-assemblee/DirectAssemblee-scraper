'use strict';

let cron = require('node-cron');
let Promise = require('bluebird');

let DeputyService = require('./database/DeputyService.js');
let BallotService = require('./database/BallotService.js');
let VoteService = require('./database/VoteService.js');
let MandateService = require('./database/MandateService.js');
let ExtraPositionService = require('./database/ExtraPositionService.js');
let DeclarationService = require('./database/DeclarationService.js');
let WorkService = require('./database/WorkService.js');
let ExtraInfoService = require('./database/ExtraInfoService');
let BallotsScrapingService = require('./BallotsScrapingService');
let DeputiesScrapingService = require('./DeputiesScrapingService');
let DeputyHelper = require('./helpers/DeputyHelper')
let DeclarationScrapingService = require('./DeclarationScrapingService')

const DEBUG = false;
const SCRAP_TIMES = '0 0,10,15,18 * * *';
const RANGE_STEP = 10;

let self = module.exports = {
    scrapThenStartService: function() {
        self.startScraping()
        .then(function() {
            self.startService();
        })
    },

    startService: function() {
        cron.schedule(SCRAP_TIMES, function() {
            console.log('=> start looking for new votes');
            self.startScraping()
        });
    },

    startScraping: async function() {
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
                console.log('* found ' + nonUpdatedDeputies.length + ' non updated deputies');
                let promises = [];
                for (let i in nonUpdatedDeputies) {
                    promises.push(DeputiesScrapingService.checkMandate(nonUpdatedDeputies[i]))
                }
                return Promise.all(promises)
                .then(function(doneDeputies) {
                    let promises = [];
                    if (doneDeputies) {
                        for (let i in doneDeputies) {
                            if (doneDeputies[i].endOfMandateDate) {
                                promises.push(DeputyService.saveEndOfMandate(doneDeputies[i]))
                            }
                        }
                    }
                    console.log('* updating ' + promises.length + ' done deputies');
                    return Promise.all(promises)
                })
            })
            .then(function() {
                console.log('==> done updating database !!')
                return;
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
    for (let i = start ; i < deputies.length ; i = i + RANGE_STEP) {
        let end = i + RANGE_STEP;
        if (end > deputies.length) {
            end = deputies.length;
        }
        slices.push(deputies.slice(i, end))
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
        let promises = [];
        for (let i in deputiesRetrieved) {
            if (deputiesRetrieved[i]) {
                promises.push(insertDeputy(deputiesRetrieved[i]));
            }
        }
        return Promise.all(promises);
    })
}

let insertDeputy = function(deputy) {
    return DeputyService.insertDeputy(deputy, true)
    .then(function(insertedDeputy) {
        return MandateService.insertMandates(deputy.mandates, insertedDeputy.officialId)
        .then(function() {
            console.log('-- inserted mandates for deputy : ' + deputy.lastname)
            return ExtraPositionService.insertExtraPositions(deputy.extraPositions, insertedDeputy.officialId);
        })
        .then(function() {
            console.log('-- inserted extra positions for deputy : ' + deputy.lastname)
            return DeclarationService.insertDeclarations(deputy.declarations, insertedDeputy.officialId);
        })
        .then(function() {
            console.log('-- inserted declarations for deputy : ' + deputy.lastname)
            return insertWorks(deputy.works, insertedDeputy.officialId)
            .then(function() {
                if (deputy.works && deputy.works.length > 0) {
                    console.log('-- inserted works for deputy : ' + deputy.lastname)
                    RequestService.sendDeputyUpdateNotif(deputy.officialId);
                }
                return;
            })
        })
    })
}

let insertWorks = function(works, deputyId) {
    return WorkService.clearWorksForDeputy(deputyId)
    .then(function(removedWorks) {
        return WorkService.insertWorks(works, deputyId)
    })
}

let retrieveAndInsertBallotsByRange = function(ballots, start) {
    let slices = [];
    for (let i = start ; i < ballots.length ; i = i + RANGE_STEP) {
        let end = i + RANGE_STEP;
        if (end > ballots.length) {
            end = ballots.length;
        }
        slices.push(ballots.slice(i, end))
    }

    let i = start;
    let end;
    return Promise.mapSeries(slices, function(ballotsSlice) {
        end = i + RANGE_STEP;
        console.log('- retrieving ballots range ' + i + '-' + end);
        i += RANGE_STEP;
        return retrieveAndInsertBallots(ballotsSlice);
    });
}

let retrieveAndInsertBallots = function(ballotsRange) {
    return BallotsScrapingService.retrieveBallots(ballotsRange)
    .then(function(ballotsRangeRetrieved) {
        return insertBallots(ballotsRangeRetrieved, 0)
        .then(function(insertedBallots) {
            return insertVotesForBallots(insertedBallots, ballotsRangeRetrieved);
        })
    })
}

let insertBallots = function(ballots) {
    let promises = [];
    for (let i in ballots) {
        if (ballots[i]) {
            promises.push(insertBallot(ballots[i]));
        }
    }
    return Promise.all(promises)
}

let insertBallot = function(ballot) {
    return BallotService.insertBallot(ballot, true)
}

let insertVotesForBallots = function(insertedBallots, ballots) {
    return DeputyService.getDeputiesNames()
    .then(function(deputies) {
        let promises = [];
        for (let i in ballots) {
            if (insertedBallots[i]) {
                promises.push(insertVotesForBallot(insertedBallots[i], ballots[i].votes, deputies))
            }
        }
        return Promise.all(promises);
    })
}

let insertVotesForBallot = async function(ballot, votes, deputies) {
    let promises = [];
    for (let i in votes) {
        let vote = votes[i]
        let deputyId;
        if (vote.deputy.officialId) {
            deputyId = await DeputyService.findDeputyWithOfficialId(vote.deputy.officialId);
        } else {
            deputyId = DeputyHelper.getDeputyIdForVoteInBallot(deputies, vote);
        }
        if (deputyId) {
            let voteToInsert = { deputyId: deputyId, ballotId: ballot.id, value: vote.value }
            promises.push(insertVoteForBallotAndFixNonVotings(ballot, voteToInsert));
        }
    }
    return Promise.all(promises)
}

let insertVoteForBallotAndFixNonVotings = function(ballot, voteToInsert) {
    return VoteService.insertVote(voteToInsert)
    .then(function() {
        return VoteService.findVotesWithValueForBallot(ballot.id, 'non-voting')
        .then(function(nonVoting) {
            ballot.nonVoting = nonVoting.length;
            return BallotService.insertBallot(ballot, true);
        })
    })
}
