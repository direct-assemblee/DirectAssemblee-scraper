let Promise = require('bluebird');
let Constants = require('./Constants.js')

let BallotsListParser = require('./parsers/BallotsListParser');
let BallotParser = require('./parsers/BallotParser');
let BallotThemeParser = require('./parsers/BallotThemeParser');
let BallotTypeHelper = require('./helpers/BallotTypeHelper');
let DateHelper = require('./helpers/DateHelper');
let EmailService = require('./EmailService');
let BallotService = require('./database/BallotService');

const PARAM_BALLOT_TYPE = '{ballot_type}';

const BALLOT_OFFICIAL_TYPES = BallotTypeHelper.allTypes();
const BALLOTS_PAGE_SIZE = 100;
const BALLOTS_LIST_URL = Constants.BASE_URL + 'scrutins/liste/offset/' + Constants.PARAM_OFFSET + '/(type)/' + PARAM_BALLOT_TYPE + '/(idDossier)/TOUS/(legislature)/' + Constants.MANDATE_NUMBER;

let self = module.exports = {
    retrieveBallotsList: async function() {
        let lastBallotDate = await BallotService.findLastBallotDate();

        let promises = [];
        for (let i = 0 ; i < BALLOT_OFFICIAL_TYPES.length ; i++) {
            promises.push(retrieveBallotsListOfType(BALLOT_OFFICIAL_TYPES[i], lastBallotDate))
        }
        return Promise.all(promises)
        .then(function(ballots) {
            return self.filterBallots(ballots)
            .then(function(allBallots) {
                let count = allBallots ? allBallots.length : 0;
                console.log(count + ' ballots added in the last 30 days')
                return allBallots;
            })
        })
    },

    filterBallots: async function(ballots) {
        let undefinedId = await BallotTypeHelper.getBallotTypeId(BallotTypeHelper.BALLOT_OFFICIAL_TYPE_UNDEFINED)

        let allBallots = [];
        for (let i in ballots) {
            for (let j in ballots[i]) {
                let existingBallot = findBallotWithUrl(allBallots, ballots[i][j].analysisUrl)
                if (existingBallot) {
                    if (existingBallot.type == undefinedId) {
                        existingBallot.type = ballots[i][j].type
                    }
                } else {
                    allBallots.push(ballots[i][j]);
                }
            }
        }
        return allBallots
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

let findBallotWithUrl = function(allBallots, url) {
    let ballot
    for (let i in allBallots) {
        if (url === allBallots[i].analysisUrl) {
            ballot = allBallots[i];
            break;
        }
    }
    return ballot;
}

let retrieveBallotsListOfType = async function(ballotOfficialType, lastBallotDate) {
    let results = [];
    let page = 0;

    let shouldGetNext = true;
    while (shouldGetNext) {
        let url = getBallotsListPageUrl(ballotOfficialType, page);
        let ballots = await retrieveBallotsListOfTypeWithPage(url, ballotOfficialType, lastBallotDate);

        shouldGetNext = false;
        if (ballots && ballots.length > 0) {
            for (let i in ballots) {
                results.push(ballots[i]);
            }
            shouldGetNext = ballots.length == BALLOTS_PAGE_SIZE;
        }
        page++;
    }
    return results;
}

let getBallotsListPageUrl = function(ballotType, pageOffset) {
    return BALLOTS_LIST_URL.replace(Constants.PARAM_OFFSET, pageOffset * BALLOTS_PAGE_SIZE).replace(PARAM_BALLOT_TYPE, ballotType);
}

let retrieveBallotsListOfTypeWithPage = function(url, ballotOfficialType, lastBallotDate) {
    return FetchUrlService.retrieveContent(url, BallotsListParser)
    .then(function(ballots) {
        if (ballots) {
            return Promise.filter(ballots, function(ballot) {
                return ballot != undefined && (!lastBallotDate || DateHelper.isLessThanAMonthOlder(ballot.date, lastBallotDate));
            })
            .map(function(ballot) {
                return adjustBallotType(ballot, ballotOfficialType)
            })
        } else {
            console.log('/!\\ ballot list : no content')
            return;
        }
    });
}

let adjustBallotType = async function(ballot, ballotOfficialType) {
    let workType
    if (ballot.title.indexOf('motion de censure') > 0) {
        workType = BallotTypeHelper.BALLOT_OFFICIAL_TYPE_MOTION;
    } else if (!ballot.type) {
        workType = (ballotOfficialType === BallotTypeHelper.BALLOT_OFFICIAL_TYPE_ALL) ? BallotTypeHelper.BALLOT_OFFICIAL_TYPE_UNDEFINED : ballotOfficialType;
    } else {
        workType = ballot.type
    }
    ballot.type = await BallotTypeHelper.getBallotTypeId(workType)
    return ballot
}

let retrieveBallotDetails = function(ballot, attempts) {
    return FetchUrlService.retrieveContent(ballot.analysisUrl, BallotParser)
    .then(function(ballotAnalysis) {
        return mergeBallotWithAnalysis(ballot, ballotAnalysis);
    });
}

let mergeBallotWithAnalysis = function(ballot, ballotAnalysis) {
    if (ballotAnalysis) {
        ballot.title = ballotAnalysis.title;
        ballot.dateDetailed = ballotAnalysis.dateDetailed;
        ballot.totalVotes = ballotAnalysis.totalVotes;
        ballot.yesVotes = ballotAnalysis.yesVotes;
        ballot.noVotes = ballotAnalysis.noVotes;
        ballot.votes = ballotAnalysis.votes
        ballot.isAdopted = ballotAnalysis.isAdopted;
    }
    return ballot
}
