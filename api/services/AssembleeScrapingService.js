var cron = require('node-cron');
var Promise = require("bluebird");
var moment = require('moment');

var FetchUrlService = require('./FetchUrlService.js');
var DeputyService = require('./database/DeputyService.js');
var BallotService = require('./database/BallotService.js');
var LawListService = require('./database/LawListService.js');
var VoteService = require('./database/VoteService.js');
var MandateService = require('./database/MandateService.js');
var DeclarationService = require('./database/DeclarationService.js');
var WorkService = require('./database/WorkService.js');
var DeputeVotesParser = require('./parsers/DeputeVotesParser');
var LawListParser = require('./parsers/LawListParser');
var BallotsScrapingService = require('./BallotsScrapingService');
var DeputiesScrapingService = require('./DeputiesScrapingService');
var DeputyHelper = require('./helpers/DeputyHelper')

const EVERY_MINUTE = '* * * * *';
const EVERY_HOUR = '1 * * * *';
const RANGE_STEP = 10;

var lastScanTime = new Date();
var yesterday = moment().subtract(100, 'days').format("YYYY-MM-DD");

var insertDeputies = function(parsedDeputies) {
  return insertAllDeputies(parsedDeputies)
  .then(function(insertedDeputies) {
    console.log("inserted or updated " + insertedDeputies.length + " deputies")
    return insertedDeputies;
  })
}

var insertAllDeputies = function(deputies) {
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

var insertBallots = function(parsedBallots) {
  return insertAllBallots(parsedBallots)
  .then(function(insertedBallots) {
    console.log("inserted or updated " + insertedBallots.length + " ballots")
    return DeputyService.getDeputiesNames()
    .then(function(deputies) {
      var promises = [];
      for (i in parsedBallots) {
        promises.push(insertVotesForBallot(parsedBallots[i], deputies))
      }
      return Promise.all(promises)
    })
  })
}

var insertAllBallots = function(ballots) {
  var promises = [];
  for (i in ballots) {
    promises.push(insertBallot(ballots[i]));
  }
  return Promise.all(promises)
}

var insertBallot = function(ballot) {
  return BallotService.insertBallot(ballot, true)
}

var insertVotesForBallot = function(ballot, deputies) {
  var votes = ballot.votes;
  var promises = [];
  for (i in votes) {
    var deputyId = DeputyHelper.getDeputyIdForVoteInBallot(deputies, votes[i]);
    if (deputyId) {
      var vote = { deputyId: deputyId, ballotId: ballot.id, value: votes[i].value}
      promises.push(VoteService.insertVote(vote))
    }
  }
  return Promise.all(promises)
}
/*
var retrieveAllVotes = function(insertedDeputes, startIndex) {
  var endIndex = startIndex + Math.min(insertedDeputes.length - startIndex, RANGE_STEP);
  var deputes = insertedDeputes.slice(startIndex, endIndex);
  if (deputes.length > 0) {
    console.log("-- retrieving votes for deputes " + startIndex + " to " + endIndex);
    return retrieveVotesForDeputeRange(deputes)
    .then(function(insertedVotesCount) {
      return retrieveAllVotes(insertedDeputes, startIndex + RANGE_STEP)
    })
  }
}

var retrieveVotesForDeputeRange = function(deputes) {
  var getDeputeVotesPromises = [];
  for (var i = 0 ; i < deputes.length ; i++) {
    getDeputeVotesPromises.push(retrieveDeputeVotes(deputes[i], 0, []));
  }
  return Promise.all(getDeputeVotesPromises)
  .then(function(votes) {
    var allVotes = [];
		for (i in votes) {
			allVotes = allVotes.concat(votes[i]);
		}
    // console.log("allVotes : " + allVotes.length)
		return allVotes;
  })
  .then(function(allVotes) {
    var getLawInfosPromises = [];
    var allLawIds = [];
    for (var j in allVotes) {
      var lawId = allVotes[j].lawId;
      if (allLawIds.indexOf(lawId) == -1) {
        allLawIds.push(lawId);
        getLawInfosPromises.push(retrieveLawInfosIfNotExists(allVotes[j]));
      }
    }
    console.log("number of laws to insert " + allLawIds.length)
    return Promise.all(getLawInfosPromises)
    .then(function(allLawInfos) {
      return allVotes;
    })
  })
  .then(function(votesToInsert) {
    var insertVotesPromises = [];
    for (var k in votesToInsert) {
      insertVotesPromises.push(VoteService.insertVote(votesToInsert[k]));
    }
    console.log("number of votes to insert " + insertVotesPromises.length)
    return Promise.all(insertVotesPromises);
  })
  .then(function(insertedVotes) {
    return Promise.reduce(insertedVotes, function(total, vote) {
      if (vote) {
        total++;
      }
      return total;
    }, 0)
    .then(function(insertedCount) {
      console.log("finished votes insertion " + insertedCount)
      return insertedCount;
    });
  });
}

var retrieveDeputeVotes = function(depute, pageOffset, previousVotes) {
  // console.log("retrieveDeputeVotes " + depute.lastname + " " + pageOffset)
  var votesUrl = Constants.DEPUTE_VOTES_URL.replace(Constants.PARAM_OFFSET, pageOffset * 10).replace(Constants.PARAM_DEPUTY_ID, depute.officialId);
  return FetchUrlService.retrieveContent(votesUrl)
  .then(function(content) {
    return DeputeVotesParser.parse(depute.id, content)
    .then(function(votes) {
      for (var i in votes) {
        previousVotes.push(votes[i]);
      }
      var lastVote = previousVotes[previousVotes.length - 1];
      if (lastVote) {
        return VoteService.findDeputeVoteForLaw(lastVote.deputeId, lastVote.lawId)
        .then(function(found) {
          if (!found && votes.length >= 10) {
            var newOffset = pageOffset + 1;
            return retrieveDeputeVotes(depute, newOffset, previousVotes);
          } else {
            return Promise.resolve(previousVotes);
          }
        })
      } else {
        return Promise.resolve(previousVotes);
      }
    })
  });
}

var retrieveLawInfosIfNotExists = function(vote) {
  return LawService.checkIfLawExists(vote.lawId)
  .then(function(lawExists) {
    if (!lawExists) {
      // console.log("law doesn't exists " + vote.officialId)
      return retrieveLawInfos(vote.lawId)
      .then(function(insertedLaw) {
        return vote;
      });
    } else {
      // console.log("law already exists " + vote.officialId)
      return vote;
    }
  })
}

var retrieveLawInfos = function(lawId) {
  var lawUrl = Constants.LAW_URL.replace(Constants.PARAM_LAW_ID, lawId);
  return FetchUrlService.retrieveContent(lawUrl)
  .then(function(content) {
    return new Promise(function(resolve, reject) {
      LawListParser.parse(lawId, content, function(lawInfos) {
        LawListService.insertLaw(lawInfos)
        .then(function(insertedLaw) {
          resolve(insertedLaw);
        })
      })
    })
  })
}

var retrieveAllDeputesPhotos = function(deputes) {
  for (i in deputes) {
    var photoUrl = Constants.DEPUTE_PHOTO_URL.replace(Constants.PARAM_DEPUTY_ID, deputes[i].officialId)
    FetchUrlService.retrievePhoto(photoUrl);
  }
}
*/

var retrieveDeputiesRange = function(deputies, start) {
  var end = start + RANGE_STEP;
  if (end > deputies.length) {
    end = deputies.length;
  }
  console.log(start + "-" + end);
  var deputiesRange = deputies.slice(start, end);
  return DeputiesScrapingService.retrieveDeputies(deputiesRange)
  .then(function(deputiesRetrieved) {
    console.log("retrieved deputies " + deputiesRetrieved.length)
    return insertDeputies(deputiesRetrieved);
  })
  .then(function(insertedDeputies) {
    console.log("inserted deputies " + insertedDeputies.length)
    var newStart = start + RANGE_STEP
    if (newStart < deputies.length) {
      return retrieveDeputiesRange(deputies, newStart)
    } else {
      return;
    }
  })
}

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
      BallotsScrapingService.retrieveBallots()
      .then(function(ballots) {
        return insertBallots(ballots);
      })
    })
  }
}
