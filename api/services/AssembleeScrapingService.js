var cron = require('node-cron');
var Promise = require("bluebird");
var moment = require('moment');

var FetchUrlService = require('./FetchUrlService.js');
var DeputyService = require('./database/DeputyService.js');
var BallotService = require('./database/BallotService.js');
var VoteService = require('./database/VoteService.js');
var MandateService = require('./database/MandateService.js');
var DeclarationService = require('./database/DeclarationService.js');
var WorkService = require('./database/WorkService.js');
var DeputeVotesParser = require('./parsers/DeputeVotesParser');
var BallotsScrapingService = require('./BallotsScrapingService');
var DeputiesScrapingService = require('./DeputiesScrapingService');
var DeputyHelper = require('./helpers/DeputyHelper')

const EVERY_MINUTE = '* * * * *';
const EVERY_HOUR = '1 * * * *';
const RANGE_STEP = 10;

var self = module.exports = {
  startService: function() {
    cron.schedule(EVERY_HOUR, function() {
      console.log('start looking for new votes');
      self.startScraping()
    });
  },

  startScraping: function() {
    DeputiesScrapingService.retrieveDeputiesList()
    .then(function(deputies) {
      return retrieveDeputiesRange(deputies, 0)
    })
    .then(function() {
      console.log('start scraping ballots');
      BallotsScrapingService.retrieveBallotsList()
      .then(function(ballots) {
        return retrieveBallotsRange(ballots, 0);
      })
      .then(function() {
        console.log("done scraping")
      })
    })
  }
}

var retrieveDeputiesRange = function(deputies, start) {
  var end = start + RANGE_STEP;
  if (end > deputies.length) {
    end = deputies.length;
  }
  console.log("- retrieving deputies range " + start + "-" + end);
  var deputiesRange = deputies.slice(start, end);
  return DeputiesScrapingService.retrieveDeputies(deputiesRange)
  .then(function(deputiesRetrieved) {
    console.log("-- retrieved deputies " + deputiesRetrieved.length)
    return insertDeputies(deputiesRetrieved);
  })
  .then(function(insertedDeputies) {
    console.log("--- inserted deputies " + insertedDeputies.length)
    var newStart = start + RANGE_STEP
    if (newStart < deputies.length) {
      return retrieveDeputiesRange(deputies, newStart)
    } else {
      return;
    }
  })
}

var insertDeputies = function(deputies) {
  var promises = [];
  for (i in deputies) {
    promises.push(insertDeputy(deputies[i]));
  }
  return Promise.all(promises)
}

var insertDeputy = function(deputy) {
  return DeputyService.insertDeputy(deputy, true)
  .then(function(insertedDeputy) {
    return MandateService.insertMandates(deputy.mandates, insertedDeputy.id)
    .then(function(insertedMandates) {
      console.log("inserted " + insertedMandates.length + " mandates for deputy : " + deputy.lastname)
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
}

var retrieveBallotsRange = function(ballots, start) {
  var end = start + RANGE_STEP;
  if (end > ballots.length) {
    end = ballots.length;
  }
  console.log("- retrieving ballots range " + start + "-" + end);
  var ballotsRange = ballots.slice(start, end);
  return BallotsScrapingService.retrieveBallots(ballotsRange)
  .then(function(ballotsRangeRetrieved) {
    console.log("-- retrieved ballotsRange " + ballotsRangeRetrieved.length)
    return insertBallots(ballotsRangeRetrieved, 0)
    .then(function(insertedBallots) {
      console.log("--- inserted ballots " + insertBallots.length)
      return insertVotesForBallots(ballotsRangeRetrieved)
    })
    .then(function(insertedVotes) {
      console.log("---- inserted votes " + insertedVotes.length)
      var newStart = start + RANGE_STEP
      if (newStart < ballots.length) {
        return retrieveBallotsRange(ballots, newStart)
      } else {
        return;
      }
    })
  })
}

var insertBallots = function(ballots) {
  var promises = [];
  for (i in ballots) {
    promises.push(insertBallot(ballots[i]));
  }
  return Promise.all(promises)
}

var insertBallot = function(ballot) {
  return BallotService.insertBallot(ballot, true)
}

var insertVotesForBallots = function(ballots) {
  return DeputyService.getDeputiesNames()
  .then(function(deputies) {
    var promises = [];
    for (i in ballots) {
      promises.push(insertVotesForBallot(ballots[i], deputies))
    }
    return Promise.all(promises)
  })
}

var insertVotesForBallot = function(ballot, deputies) {
  var votes = ballot.votes;
  var promises = [];
  for (i in votes) {
    var vote = votes[i]
    var deputyId = vote.deputyId;
    if (!deputyId) {
      deputyId = DeputyHelper.getDeputyIdForVoteInBallot(deputies, vote);
    }
    if (deputyId) {
      var vote = { deputyId: deputyId, ballotId: ballot.id, value: vote.value }
      promises.push(VoteService.insertVote(vote))
    }
  }
  return Promise.all(promises)
}
