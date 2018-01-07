let Promise = require('bluebird');
let Constants = require('./Constants.js')

let BallotsListParser = require('./parsers/BallotsListParser');
let BallotParser = require('./parsers/BallotParser');
let BallotThemeParser = require('./parsers/BallotThemeParser');
let ThemeHelper = require('./helpers/ThemeHelper');
let DateHelper = require('./helpers/DateHelper');
let EmailService = require('./EmailService');
let BallotService = require('./database/BallotService');

const MAX_THEME_LENGTH = 55;
const PARAM_BALLOT_TYPE = '{ballot_type}';
const BALLOT_TYPE_ORDINARY = 'SOR';
const BALLOT_TYPE_SOLEMN = 'SSO';
const BALLOT_TYPE_OTHER = 'AUT';
const BALLOT_TYPE_ALL = 'TOUS';
const BALLOT_TYPES = [ BALLOT_TYPE_ALL, BALLOT_TYPE_ORDINARY, BALLOT_TYPE_SOLEMN, BALLOT_TYPE_OTHER ];
const BALLOTS_PAGE_SIZE = 100;
const BALLOTS_LIST_URL = Constants.BASE_URL + 'scrutins/liste/offset/' + Constants.PARAM_OFFSET + '/(type)/' + PARAM_BALLOT_TYPE + '/(idDossier)/TOUS/(legislature)/' + Constants.MANDATE_NUMBER;

module.exports = {
    retrieveBallotsList: async function() {
        let lastBallotDate = await BallotService.findLastBallotDate();

        let promises = [];
        for (let i = 0 ; i < BALLOT_TYPES.length ; i++) {
            promises.push(retrieveBallotsListOfType(BALLOT_TYPES[i], lastBallotDate))
        }
        return Promise.all(promises)
        .then(function(ballots) {
            let allBallots = [];
            for (let i in ballots) {
                for (let j in ballots[i]) {
                    if (isNewBallot(allBallots, ballots[i][j].analysisUrl)) {
                        allBallots.push(ballots[i][j]);
                    }
                }
            }
            let count = allBallots ? allBallots.length : 0;
            console.log(count + ' ballots added in the last 30 days')
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

let isNewBallot = function(allBallots, url) {
    let isNew = true;
    for (let i in allBallots) {
        if (url === allBallots[i].analysisUrl) {
            isNew = false;
            break;
        }
    }
    return isNew;
}

let retrieveBallotsListOfType = async function(ballotType, lastBallotDate) {
    let results = [];
    let page = 0;

    let shouldGetNext = true;
    while (shouldGetNext) {
        let url = getBallotsListPageUrl(ballotType, page);
        let ballots = await retrieveBallotsListOfTypeWithPage(url, ballotType, lastBallotDate);

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

let retrieveBallotsListOfTypeWithPage = function(url, ballotType, lastBallotDate) {
    if (ballotType === 'TOUS') {
        ballotType = 'SOR'; // default value
    }
    return FetchUrlService.retrieveContent(url, BallotsListParser)
    .then(function(ballots) {
        if (ballots) {
            return Promise.filter(ballots, function(ballot) {
                return ballot != undefined && (!lastBallotDate || DateHelper.isLessThanAMonthOlder(ballot.date, lastBallotDate));
            })
            .map(function(ballot) {
                if (ballot.title.indexOf('motion de censure') > 0) {
                    ballot.type = 'motion_of_censure';
                } else if (!ballot.type) {
                    ballot.type = ballotType;
                }
                return ballot;
            })
        } else {
            console.log('/!\\ ballot list : no content')
            return;
        }
    });
}

let retrieveBallotDetails = function(ballot, attempts) {
    return FetchUrlService.retrieveContent(ballot.analysisUrl, BallotParser)
    .then(function(ballotAnalysis) {
        let fullBallot = mergeBallotWithAnalysis(ballot, ballotAnalysis);
        return retrieveBallotTheme(fullBallot);
    });
}

let retrieveBallotTheme = function(ballot) {
    if (ballot.fileUrl) {
        return FetchUrlService.retrieveContentWithIsoEncoding(ballot.fileUrl, true, BallotThemeParser)
        .then(function(parsedTheme) {
            if (parsedTheme && parsedTheme.theme) {
                return ThemeHelper.findTheme(parsedTheme.theme)
                .then(function(foundTheme) {
                    if (foundTheme) {
                        ballot.theme = foundTheme;
                        ballot.originalThemeName = parsedTheme.themeDetail;
                    } else {
                        console.log('/!\\ new theme not recognized : ' + parsedTheme);
                    }
                    return ballot;
                })
                .then(function(ballot) {
                    let fullTheme = ballot.originalThemeName;
                    if (fullTheme && fullTheme.length > MAX_THEME_LENGTH) {
                        let shortName = ThemeHelper.findShorterName(fullTheme)
                        if (!shortName) {
                            EmailService.sendThemeTooLongEmail(ballot.originalThemeName);
                        }
                    }
                    return ballot;
                })
            } else {
                return ballot;
            }
        })
    } else {
        return new Promise(function(resolve, reject) {
            if (ballot.title.indexOf('politique générale') > 0) {
                return ThemeHelper.findTheme('Politique générale')
                .then(function(foundTheme) {
                    if (foundTheme) {
                        ballot.theme = foundTheme;
                    }
                    resolve(ballot);
                })
            } else {
                resolve(ballot);
            }
        })
    }
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
