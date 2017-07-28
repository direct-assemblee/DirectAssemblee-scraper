'use strict';

var cron = require('node-cron');
var Promise = require("bluebird");
var moment = require('moment');

var FetchUrlService = require('./FetchUrlService.js');
var DeputyService = require('./database/DeputyService.js');
var BallotService = require('./database/BallotService.js');
var VoteService = require('./database/VoteService.js');
var MandateService = require('./database/MandateService.js');
var ExtraPositionService = require('./database/ExtraPositionService.js');
var DeclarationService = require('./database/DeclarationService.js');
var WorkService = require('./database/WorkService.js');
var BallotsScrapingService = require('./BallotsScrapingService');
var DeputiesScrapingService = require('./DeputiesScrapingService');
var DeputyHelper = require('./helpers/DeputyHelper')

const DEBUG = false;
const EVERY_MINUTE = '* * * * *';
const SCRAP_TIMES = '0 0,10,15,18 * * *';
const RANGE_STEP = 10;

var self = module.exports = {
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
        return DeputiesScrapingService.retrieveDeputiesList()
        .then(function(allDeputies) {
            var deputies = subArrayIfDebug(allDeputies, 0, 10);
            return retrieveAndInsertDeputiesByRange(deputies, 0)
        })
        .then(function() {
            console.log('==> start scraping ballots');
            return BallotsScrapingService.retrieveBallotsList()
            .then(function(allBallots) {
                var ballots = subArrayIfDebug(allBallots, 0, 10);
                return retrieveAndInsertBallotsByRange(ballots, 0);
            })
        })
        .then(function() {
            console.log('=> look for non-updated deputies');
            return DeputyService.findNonUpdatedDeputies()
            .then(function(nonUpdatedDeputies) {
                console.log('found ' + nonUpdatedDeputies.length + " non updated deputies");
                var promises = [];
                for (var i in nonUpdatedDeputies) {
                    promises.push(DeputiesScrapingService.checkMandate(nonUpdatedDeputies[i]))
                }
                return Promise.all(promises)
                .then(function(doneDeputies) {
                    var promises = [];
                    if (doneDeputies) {
                        for (var i in doneDeputies) {
                            if (doneDeputies[i].endOfMandateDate) {
                                promises.push(DeputyService.saveEndOfMandate(doneDeputies[i]))
                            }
                        }
                    }
                    console.log('updating ' + promises.length + " done deputies");
                    return Promise.all(promises)
                })
            })
            .then(function() {
                console.log("done updating database !!")
                return;
            })
        })
    }
}

var subArrayIfDebug = function(array, start, size) {
    if (DEBUG) {
        var subArray = [];
        for (var i = start ; i < start + size ; i++) {
            subArray.push(array[i])
        }
        return subArray;
    } else {
        return array;
    }
}

var retrieveAndInsertDeputiesByRange = function(deputies, start) {
    var slices = [];
    for (var i = start ; i < deputies.length ; i = i + RANGE_STEP) {
        var end = i + RANGE_STEP;
        if (end > deputies.length) {
            end = deputies.length;
        }
        slices.push(deputies.slice(i, end))
    }

    var i = start;
    var end;
    return Promise.each(slices, function(dep) {
        end = i + RANGE_STEP;
        console.log("- retrieving deputies range " + i + "-" + end);
        i += RANGE_STEP;
        return retrieveAndInsertDeputies(dep)
    });
}

var retrieveAndInsertDeputies = function(deputiesRange) {
    return DeputiesScrapingService.retrieveDeputies(deputiesRange)
    .then(function(deputiesRetrieved) {
        console.log("-- retrieved deputies " + deputiesRetrieved.length)
        for (var i in deputiesRetrieved) {
            insertDeputy(deputiesRetrieved[i]);
        }
        return;
    })
}

var insertDeputy = function(deputy) {
    return DeputyService.insertDeputy(deputy, true)
    .then(function(insertedDeputy) {
        return MandateService.insertMandates(deputy.mandates, insertedDeputy.id)
        .then(function(insertedMandates) {
            console.log("inserted " + insertedMandates.length + " mandates for deputy : " + deputy.lastname)
            return ExtraPositionService.insertExtraPositions(deputy.extraPositions, insertedDeputy.id)
            .then(function(insertedExtraPositions) {
                console.log("inserted " + insertedExtraPositions.length + " extra positions for deputy : " + deputy.lastname)
                return DeclarationService.insertDeclarations(deputy.declarations, insertedDeputy.id)
                .then(function(insertedDeclarations) {
                    console.log("inserted " + insertedDeclarations.length + " declarations for deputy : " + deputy.lastname)
                    return WorkService.insertWorks(deputy.works, insertedDeputy.id)
                    .then(function(insertedWorks) {
                        console.log("inserted " + insertedWorks.length + " works for deputy : " + deputy.lastname)
                    })
                })
            })
        })
    })
}

var retrieveAndInsertBallotsByRange = function(ballots, start) {
    var slices = [];
    for (var i = start ; i < ballots.length ; i = i + RANGE_STEP) {
        var end = i + RANGE_STEP;
        if (end > ballots.length) {
            end = ballots.length;
        }
        slices.push(ballots.slice(i, end))
    }

    var i = start;
    var end;
    return Promise.each(slices, function(ballotsSlice) {
        end = i + RANGE_STEP;
        console.log("- retrieving ballots range " + i + "-" + end);
        i += RANGE_STEP;
        return retrieveAndInsertBallots(ballotsSlice)
    });
}

var retrieveAndInsertBallots = function(ballotsRange) {
    return BallotsScrapingService.retrieveBallots(ballotsRange)
    .then(function(ballotsRangeRetrieved) {
        console.log("-- retrieved ballotsRange " + ballotsRangeRetrieved.length)
        return insertBallots(ballotsRangeRetrieved, 0)
        .then(function(insertedBallots) {
            console.log("--- inserted ballots " + insertedBallots.length)
            return insertVotesForBallots(insertedBallots, ballotsRangeRetrieved)
            .then(function(insertedVotes) {
                console.log("---- inserted votes " + insertedVotes.length)
                return insertedBallots;
            })
        })
    })
}

var insertBallots = function(ballots) {
    var promises = [];
    for (var i in ballots) {
        if (ballots[i]) {
            promises.push(insertBallot(ballots[i]));
        }
    }
    return Promise.all(promises)
}

var insertBallot = function(ballot) {
    return BallotService.insertBallot(ballot, true)
}

var insertVotesForBallots = function(insertedBallots, ballots) {
    return DeputyService.getDeputiesNames()
    .then(function(deputies) {
        var promises = [];
        for (var i in ballots) {
            promises.push(insertVotesForBallot(insertedBallots[i].id, ballots[i].votes, deputies))
        }
        return Promise.all(promises)
    })
}

var insertVotesForBallot = function(ballotId, votes, deputies) {
    var promises = [];
    for (var i in votes) {
        var vote = votes[i]
        var deputyId;
        if (vote.deputy.id) {
            deputyId = DeputyService.findDeputyWithOfficialId(vote.deputy.id);
        } else {
            deputyId = DeputyHelper.getDeputyIdForVoteInBallot(deputies, vote);
        }
        if (deputyId) {
            var vote = { deputyId: deputyId, ballotId: ballotId, value: vote.value }
            promises.push(VoteService.insertVote(vote))
        }
    }
    return Promise.all(promises)
}
