var cron = require('node-cron');
var Promise = require("bluebird");
var moment = require('moment');

var FetchUrlService = require('./FetchUrlService.js');
var DeputeService = require('./database/DeputeService.js');
var LawService = require('./database/LawService.js');
var VoteService = require('./database/VoteService.js');
var MandateService = require('./database/MandateService.js');
var DeputeListParser = require('./parsers/DeputesListParser');
var DeputeVotesParser = require('./parsers/DeputeVotesParser');
var DeputeMandatesParser = require('./parsers/DeputeMandatesParser');
var LawParser = require('./parsers/LawParser');

const EVERY_MINUTE = '* * * * *';
const EVERY_HOUR = '1 * * * *';
const RANGE_STEP = 10;

var lastScanTime = new Date();
var yesterday = moment().subtract(100, 'days').format("YYYY-MM-DD");

var insertDeputesAndRetrieveDeputesVotes = function(parsedDeputes) {
  DeputeService.insertAllDeputes(parsedDeputes)
  .then(function(insertedDeputes) {
    console.log("inserted or updated " + insertedDeputes.length + " deputes")
    MandateService.insertAllMandates(parsedDeputes, insertedDeputes)
    return retrieveAllVotes(insertedDeputes, 0)
  })
}

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
  var votesUrl = Constants.DEPUTE_VOTES_URL.replace(Constants.PARAM_OFFSET, pageOffset * 10).replace(Constants.PARAM_DEPUTE_ID, depute.officialId);
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
      LawParser.parse(lawId, content, function(lawInfos) {
        LawService.insertLaw(lawInfos)
        .then(function(insertedLaw) {
          resolve(insertedLaw);
        })
      })
    })
  })
}

var retrieveAllDeputesPhotos = function(deputes) {
  for (i in deputes) {
    var photoUrl = Constants.DEPUTE_PHOTO_URL.replace(Constants.PARAM_DEPUTE_ID, deputes[i].officialId)
    FetchUrlService.retrievePhoto(photoUrl);
  }
}

var retrieveAllDeputesMandates = function(deputes) {
  var getDeputeMandatesPromises = [];
  for (var i = 0 ; i < deputes.length ; i++) {
    getDeputeMandatesPromises.push(retrieveDeputeMandates(deputes[i]));
  }
  return Promise.all(getDeputeMandatesPromises)
}

var retrieveDeputeMandates = function(depute) {
  var mandatesUrl = Constants.DEPUTE_INFO_URL.replace(Constants.PARAM_DEPUTE_ID, depute.officialId);
  // mandatesUrl = "http://www2.assemblee-nationale.fr/deputes/fiche/OMC_PA2952";
  // mandatesUrl = "http://www2.assemblee-nationale.fr/deputes/fiche/OMC_PA267407";
  return FetchUrlService.retrieveContent(mandatesUrl)
  .then(function(content) {
    return DeputeMandatesParser.parse(content)
    .then(function(mandates) {
      depute.mandates = mandates;
      return depute;
    })
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
    FetchUrlService.retrieveContent(Constants.DEPUTES_LIST_URL)
    .then(function(content) {
      return DeputeListParser.parse(content)
      .then(function(deputes) {
        retrieveAllDeputesPhotos(deputes)
        return retrieveAllDeputesMandates(deputes)
      })
      .then(function(deputes) {
        insertDeputesAndRetrieveDeputesVotes(deputes)
      });
    });
  }
}
