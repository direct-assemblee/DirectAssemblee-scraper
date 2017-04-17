var Promise = require("bluebird");
var Constants = require('./Constants.js')

var BallotsListParser = require('./parsers/BallotsListParser');
var BallotParser = require('./parsers/BallotParser');

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
    print(ballot)
    return Promise.resolve(ballot);
  })
}

var mergeBallotWithAnalysis = function(ballot, ballotAnalysis) {
  ballot.analysisTitle = ballotAnalysis.title;
  ballot.analysisDate = ballotAnalysis.date;
  ballot.analysisDateDetailed = ballotAnalysis.dateDetailed;
  ballot.analysisTotalVotes = ballotAnalysis.totalVotes;
  ballot.analysisYesVotes = ballotAnalysis.yesVotes;
  ballot.analysisNoVotes = ballotAnalysis.noVotes;
  ballot.analysisVotes = ballotAnalysis.votes;
  return ballot
}

var print = function(ballot) {
  // console.log("------------- ");
  // console.log("id: " + ballot.id);
  // console.log("date: " + ballot.date);
  // console.log("analysisDateDetailed: " + ballot.analysisDateDetailed);
  //
  // console.log("description: " + ballot.description);
  // console.log("type: " + ballot.type);
  //
  // console.log("analysisTotalVotes: " + ballot.analysisTotalVotes);
  // console.log("analysisYesVotes: " + ballot.analysisYesVotes);
  // console.log("analysisNoVotes: " + ballot.analysisNoVotes);
  // console.log("analysisVotes: " + ballot.analysisVotes)
  //
  // console.log("fileUrl: " + ballot.fileUrl);
  console.log("analysisUrl: " + ballot.analysisUrl);
  // console.log("------------- ");
}

module.exports = {
  retrieveBallots: function() {
    return retrieveBallotsList()
    .then(function(ballots) {
      var promises = [];
      for (var i = 0 ; i < 10 ; i++) {
        promises.push(retrieveBallotDetails(ballots[i]));
      }
      return Promise.all(promises);
    })
  }
}
