var Promise = require("bluebird");
var Constants = require('./Constants.js')

var BallotsListParser = require('./parsers/BallotsListParser');
var BallotParser = require('./parsers/BallotParser');
var BallotThemeParser = require('./parsers/BallotThemeParser');

const PARAM_BALLOT_TYPE = "{ballot_type}";
const BALLOT_TYPE_ORDINARY = "SOR";
const BALLOT_TYPE_SOLEMN = "SSO";
const BALLOT_TYPE_OTHER = "AUT";
const BALLOT_TYPE_ALL = "TOUS";
const BALLOT_TYPES = [ BALLOT_TYPE_ORDINARY, BALLOT_TYPE_SOLEMN, BALLOT_TYPE_OTHER ];
const BALLOTS_PAGE_SIZE = 100;
const BALLOTS_LIST_URL = Constants.BASE_URL + "scrutins/liste/offset/" + Constants.PARAM_OFFSET + "/(legislature)/14/(type)/" + PARAM_BALLOT_TYPE + "/(idDossier)/TOUS";

var retrieveBallotsList = function() {
  var promises = [];
  for (var i = 0 ; i < BALLOT_TYPES.length ; i++) {
    promises.push(retrieveBallotsListOfType(BALLOT_TYPES[i], 0, []))
  }
  return Promise.all(promises)
  .then(function(ballots) {
    var allBallots = [];
    for (i in ballots) {
      allBallots = allBallots.concat(ballots[i]);
    }
    return allBallots;
  })
}

var retrieveBallotsListOfType = function(ballotType, pageOffset, previousBallots) {
  var ballotsUrl = BALLOTS_LIST_URL.replace(Constants.PARAM_OFFSET, pageOffset * BALLOTS_PAGE_SIZE).replace(PARAM_BALLOT_TYPE, ballotType);
  return FetchUrlService.retrieveContent(ballotsUrl)
  .then(function(content) {
    return BallotsListParser.parse(content, ballotType)
  })
  .then(function(ballots) {
    for (var i in ballots) {
      previousBallots.push(ballots[i]);
    }
    var lastBallot = previousBallots[previousBallots.length - 1];
    if (lastBallot && ballots && ballots.length >= BALLOTS_PAGE_SIZE) {
      var newOffset = pageOffset + 1;
      return retrieveBallotsListOfType(ballotType, newOffset, previousBallots);
    } else {
      return Promise.resolve(previousBallots);
    }
  })
}

retrieveBallotDetails = function(ballot) {
  return FetchUrlService.retrieveContent(ballot.analysisUrl)
  .then(function(content) {
    return BallotParser.parse(content)
  })
  .then(function(ballotAnalysis) {
    ballot = mergeBallotWithAnalysis(ballot, ballotAnalysis)
    return Promise.resolve(ballot);
  })
  .then(function(ballot) {
    return retrieveBallotTheme(ballot);
  })
}

retrieveBallotTheme = function(ballot) {
  return FetchUrlService.retrieveContent(ballot.fileUrl, true)
  .then(function(content) {
    return BallotThemeParser.parse(content)
    .then(function(theme) {
      ballot.theme = theme;
      return ballot;
    })
  })
}

var mergeBallotWithAnalysis = function(ballot, ballotAnalysis) {
  ballot.title = ballotAnalysis.title;
  ballot.detailedDate = ballotAnalysis.detailedDate;
  ballot.totalVotes = ballotAnalysis.totalVotes;
  ballot.yesVotes = ballotAnalysis.yesVotes;
  ballot.noVotes = ballotAnalysis.noVotes;
  ballot.votes = ballotAnalysis.votes;
  return ballot
}

module.exports = {
  retrieveBallots: function() {
    return retrieveBallotsList()
    .then(function(ballots) {
      var promises = [];
      for (var i = 0 ; i < ballots.length ; i++) {
        promises.push(retrieveBallotDetails(ballots[i]));
      }
      return Promise.all(promises);
    })
  }
}
