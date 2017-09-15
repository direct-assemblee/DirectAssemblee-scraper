let Promise = require('bluebird');
let Constants = require('./Constants.js')

let BallotsListParser = require('./parsers/BallotsListParser');
let BallotParser = require('./parsers/BallotParser');
let BallotThemeParser = require('./parsers/BallotThemeParser');
let BallotThemeHelper = require('./helpers/BallotThemeHelper')

const PARAM_BALLOT_TYPE = '{ballot_type}';
const BALLOT_TYPE_ORDINARY = 'SOR';
const BALLOT_TYPE_SOLEMN = 'SSO';
const BALLOT_TYPE_OTHER = 'AUT';
const BALLOT_TYPE_ALL = 'TOUS';
const BALLOT_TYPES = [ BALLOT_TYPE_ALL, BALLOT_TYPE_ORDINARY, BALLOT_TYPE_SOLEMN, BALLOT_TYPE_OTHER ];
const BALLOTS_PAGE_SIZE = 100;
const BALLOTS_LIST_URL = Constants.BASE_URL + 'scrutins/liste/offset/' + Constants.PARAM_OFFSET + '/(type)/' + PARAM_BALLOT_TYPE + '/(idDossier)/TOUS/(legislature)/' + Constants.MANDATE_NUMBER;

module.exports = {
    retrieveBallotsList: function() {
        let promises = [];
        for (let i = 0 ; i < BALLOT_TYPES.length ; i++) {
            promises.push(retrieveBallotsListOfType(BALLOT_TYPES[i]))
        }
        return Promise.all(promises)
        .then(function(ballots) {
            let allBallots = [];
            for (let i in ballots) {
                allBallots = allBallots.concat(ballots[i]);
            }
            return allBallots;
        })
    },

    retrieveBallots: function(ballots) {
        let promises = [];
        for (let i = 0 ; i < ballots.length ; i++) {
            if (ballots[i]) {
                promises.push(retrieveBallotDetails(ballots[i], 0));
            }
        }
        return Promise.all(promises);
    }
}

let retrieveBallotsListOfType = function(ballotType) {
    return new Promise(function(resolve, reject) {
        let results = [];
        function next(page) {
            let url = getBallotsListPageUrl(ballotType, page);
            retrieveBallotsListOfTypeWithPage(url, ballotType)
            .then(function(ballots) {
                let shouldGetNext = false;
                if (ballots && ballots.length > 0) {
                    for (let i in ballots) {
                        results.push(ballots[i]);
                    }
                    shouldGetNext = ballots.length == BALLOTS_PAGE_SIZE;
                }
                if (shouldGetNext) {
                    next(page + 1);
                } else {
                    resolve(results);
                }
            }, reject);
        }
        next(0);
    });
}

let getBallotsListPageUrl = function(ballotType, pageOffset) {
    return BALLOTS_LIST_URL.replace(Constants.PARAM_OFFSET, pageOffset * BALLOTS_PAGE_SIZE).replace(PARAM_BALLOT_TYPE, ballotType);
}

let retrieveBallotsListOfTypeWithPage = function(url, ballotType) {
    return FetchUrlService.retrieveContent(url)
    .then(function(content) {
        if (content) {
            return BallotsListParser.parse(content, ballotType)
        } else {
            console.log('/!\\ ballot list : no content')
            return;
        }
    })
}

let retrieveBallotDetails = function(ballot, attempts) {
    return FetchUrlService.retrieveContent(ballot.analysisUrl)
    .then(function(content) {
        if (content) {
            if (content.indexOf('503 Service Unavailable') > 0) {
                attempts++;
                if (attempts < 3) {
                    return retrieveBallotDetails(ballot, attempts);
                } else {
                    return;
                }
            } else {
                return BallotParser.parse(ballot.analysisUrl, content)
                .then(function(ballotAnalysis) {
                    ballot = mergeBallotWithAnalysis(ballot, ballotAnalysis)
                    return ballot;
                })
                .then(function(ballot) {
                    if (ballot.fileUrl) {
                        return retrieveBallotTheme(ballot);
                    } else {
                        return ballot;
                    }
                })
            }
        } else {
            console.log('/!\\ ballot : no content')
            return;
        }
    })
}

let retrieveBallotTheme = function(ballot) {
    return FetchUrlService.retrieveContent(ballot.fileUrl, true)
    .then(function(content) {
        if (content) {
            return BallotThemeParser.parse(content)
            .then(function(parsedTheme) {
                return BallotThemeHelper.findTheme(parsedTheme)
                .then(function(theme) {
                    ballot.theme = theme;
                    return ballot;
                })
            })
        } else {
            console.log('/!\\ ballot theme : no content')
            return;
        }
    })
}

let mergeBallotWithAnalysis = function(ballot, ballotAnalysis) {
    ballot.title = ballotAnalysis.title;
    ballot.dateDetailed = ballotAnalysis.dateDetailed;
    ballot.totalVotes = ballotAnalysis.totalVotes;
    ballot.yesVotes = ballotAnalysis.yesVotes;
    ballot.noVotes = ballotAnalysis.noVotes;
    ballot.votes = ballotAnalysis.votes
    ballot.isAdopted = ballotAnalysis.isAdopted;
    return ballot
}
