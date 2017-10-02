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

    startScraping: function() {
        console.log('==> start classifying unclassified questions');
        return WorkService.classifyUnclassifiedQuestions()
        .then(function() {
            console.log('==> start scraping deputies');
            return DeputiesScrapingService.retrieveDeputiesList()
            .then(function(allDeputies) {
                let deputies = subArrayIfDebug(allDeputies, 0, 10);
                return retrieveAndInsertDeputiesByRange(deputies, 0)
            })
        })
        .then(function() {
            console.log('==> start scraping ballots');
            return BallotsScrapingService.retrieveBallotsList()
            .then(function(allBallots) {
                let ballots = subArrayIfDebug(allBallots, 0, 50);
                return retrieveAndInsertBallotsByRange(ballots, 0);
            })
        })
        .then(function() {
            console.log('=> look for non-updated deputies');
            return DeputyService.findNonUpdatedDeputies()
            .then(function(nonUpdatedDeputies) {
                console.log('found ' + nonUpdatedDeputies.length + ' non updated deputies');
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
                    console.log('updating ' + promises.length + ' done deputies');
                    return Promise.all(promises)
                })
            })
            .then(function() {
                console.log('done updating database !!')
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

let retrieveAndInsertDeputiesByRange = function(deputies, start) {
    let slices = [];
    for (let i = start ; i < deputies.length ; i = i + RANGE_STEP) {
        let end = i + RANGE_STEP;
        if (end > deputies.length) {
            end = deputies.length;
        }
        slices.push(deputies.slice(i, end))
    }

    let i = start;
    let end;
    return Promise.each(slices, function(dep) {
        end = i + RANGE_STEP;
        console.log('- retrieving deputies range ' + i + '-' + end);
        i += RANGE_STEP;
        return retrieveAndInsertDeputies(dep)
    });
}

let retrieveAndInsertDeputies = function(deputiesRange) {
    return DeputiesScrapingService.retrieveDeputies(deputiesRange)
    .then(function(deputiesRetrieved) {
        console.log('-- retrieved deputies ' + deputiesRetrieved.length)
        for (let i in deputiesRetrieved) {
            insertDeputy(deputiesRetrieved[i]);
        }
        return;
    })
}

let insertDeputy = function(deputy) {
    return DeputyService.insertDeputy(deputy, true)
    .then(function(insertedDeputy) {
        return MandateService.insertMandates(deputy.mandates, insertedDeputy.officialId)
        .then(function(insertedMandates) {
            console.log('inserted ' + insertedMandates.length + ' mandates for deputy : ' + deputy.lastname)
            return ExtraPositionService.insertExtraPositions(deputy.extraPositions, insertedDeputy.officialId)
            .then(function(insertedExtraPositions) {
                console.log('inserted ' + insertedExtraPositions.length + ' extra positions for deputy : ' + deputy.lastname)
                return DeclarationService.insertDeclarations(deputy.declarations, insertedDeputy.officialId)
                .then(function(insertedDeclarations) {
                    console.log('inserted ' + insertedDeclarations.length + ' declarations for deputy : ' + deputy.lastname)
                    return insertWorks(deputy.works, insertedDeputy.officialId)
                    .then(function(insertedWorks) {
                        console.log('inserted ' + insertedWorks.length + ' works for deputy : ' + deputy.lastname)
                        return;
                    })
                })
            })
        })
    })
}

let insertWorks = function(works, deputyId) {
    return WorkService.clearWorksForDeputy(deputyId)
    .then(function(removedWorks) {
        let number = removedWorks ? removedWorks.length : 0;
        // console.log('removed ' + number + ' works');
        let promises = [];
        for (let i in works) {
            promises.push(insertWork(works[i], deputyId));
        }
        return Promise.all(promises);
    })
}

let insertWork = function(work, deputyId) {
    return WorkService.insertWork(work, deputyId)
    .then(function(insertedWork) {
        return insertExtraInfos(work.extraInfos, insertedWork.id)
    })
}

let insertExtraInfos = function(extraInfos, workId) {
    return ExtraInfoService.insertExtraInfos(extraInfos, workId);
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
    return Promise.each(slices, function(ballotsSlice) {
        end = i + RANGE_STEP;
        console.log('- retrieving ballots range ' + i + '-' + end);
        i += RANGE_STEP;
        return retrieveAndInsertBallots(ballotsSlice)
    });
}

let retrieveAndInsertBallots = function(ballotsRange) {
    return BallotsScrapingService.retrieveBallots(ballotsRange)
    .then(function(ballotsRangeRetrieved) {
        console.log('-- retrieved ballotsRange ' + ballotsRangeRetrieved.length)
        return insertBallots(ballotsRangeRetrieved, 0)
        .then(function(insertedBallots) {
            console.log('--- inserted ballots ' + insertedBallots.length)
            return insertVotesForBallots(insertedBallots, ballotsRangeRetrieved)
            .then(function(insertedVotes) {
                console.log('---- inserted votes ' + insertedVotes.length)
                return insertedBallots;
            })
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
                promises.push(insertVotesForBallot(insertedBallots[i].id, ballots[i].votes, deputies))
            }
        }
        return Promise.all(promises)
    })
}

let insertVotesForBallot = function(ballotId, votes, deputies) {
    let promises = [];
    for (let i in votes) {
        let vote = votes[i]
        let deputyId;
        if (vote.deputy.officialId) {
            deputyId = DeputyService.findDeputyWithOfficialId(vote.deputy.officialId);
        } else {
            deputyId = DeputyHelper.getDeputyIdForVoteInBallot(deputies, vote);
        }
        if (deputyId) {
            let voteToInsert = { deputyId: deputyId, ballotId: ballotId, value: vote.value }
            promises.push(VoteService.insertVote(voteToInsert))
        }
    }
    return Promise.all(promises)
}
