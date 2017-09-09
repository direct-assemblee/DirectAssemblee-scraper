let DateHelper = require('../helpers/DateHelper.js');
let htmlparser = require('htmlparser2');

const VOTES_DATA_REGEX = /let\spositions=(.+\}\])/i;

let ballotParser = function(url, callback) {
    let parsedItem = {};
    parsedItem.votes = [];
    let expectedItem;
    let currentVoteDeputy;
    let currentVoteValue;

    return new htmlparser.Parser({
        onopentag: function(tagname, attribs) {
            if (tagname === 'title') {
                expectedItem = 'date';
            } else if (attribs.class) {
                if (attribs.class === 'president-title') {
                    expectedItem = 'title';
                } else if (attribs.class === 'synthese') {
                    expectedItem = 'synthese';
                } else if (attribs.class === 'annoncevote') {
                    expectedItem = 'annoncevote';
                } else if (attribs.class.startsWith('Pour')) {
                    currentVoteValue = 'for';
                } else if (attribs.class.startsWith('Contre')) {
                    currentVoteValue = 'against';
                } else if (attribs.class.startsWith('Abstention')) {
                    currentVoteValue = 'blank';
                } else if (attribs.class.startsWith('Non-votant')) {
                    currentVoteValue = 'non-voting';
                } else if (attribs.class === 'deputes') {
                    currentVoteDeputy = {};
                    expectedItem = 'vote.firstname';
                }
            } else if (tagname === 'li' && currentVoteDeputy) {
                expectedItem = 'vote.firstname';
            } else if (tagname === 'b' && expectedItem === 'vote.firstname') {
                expectedItem = 'vote.lastname';
            }
        },
        ontext: function(text) {
            if (!parsedItem.votes) {
                let votesRegexResult = text.match(VOTES_DATA_REGEX);
                if (votesRegexResult) {
                    let votesData = votesRegexResult[1];
                    let votes = JSON.parse(votesData);
                    for (i in votes) {
                        let voteValue = votes[i].RECTIFICATION ? votes[i].RECTIFICATION : votes[i].POSITION;
                        parsedItem.votes.push({ 'deputy' : { officialId: votes[i].ID_ACTEUR }, 'value' : voteValue })
                    }
                }
            }
            if (expectedItem === 'vote.firstname') {
                let textTrimmed = text.trim();
                if (textTrimmed) {
                    textTrimmed = textTrimmed.replace('MM.', '').replace('M.', '').replace('Mmes', '').replace('Mme', '')
                    .replace(',', ' ').replace(' et ', ' ').replace(/\(.*\)/, ' ');
                    let firstname = textTrimmed;
                    if (firstname.endsWith(' de')) {
                        firstname = firstname.substring(0, firstname.length - 3);
                        currentVoteDeputy.lastname = 'de ';
                    }
                    currentVoteDeputy.firstname = firstname.trim();
                }
            } else if (expectedItem === 'vote.lastname') {
                let textTrimmed = text.trim();
                if (textTrimmed) {
                    let lastname = text;
                    if (!currentVoteDeputy.lastname) {
                        currentVoteDeputy.lastname = ''
                    }
                    currentVoteDeputy.lastname = currentVoteDeputy.lastname + lastname;
                    parsedItem.votes.push({ 'deputy': currentVoteDeputy, 'value' : currentVoteValue })
                    currentVoteDeputy = {}
                    expectedItem = 'vote.firstname';
                }
            } else if (expectedItem === 'date') {
                parsedItem.dateDetailed = text.split('-')[1].trim();
                let strDate = parsedItem.dateDetailed.split(' ').pop()
                parsedItem.date = DateHelper.formatDate(strDate);
                expectedItem = null;
            } else if (expectedItem === 'title') {
                parsedItem.title = text;
                expectedItem = null;
            } else if (expectedItem && expectedItem.startsWith('synthese') && text) {
                let textTrimmed = text.trim();
                if (expectedItem.endsWith('total')) {
                    parsedItem.totalVotes = text;
                } else if (expectedItem.endsWith('pour')) {
                    parsedItem.yesVotes = text;
                } else if (expectedItem.endsWith('contre')) {
                    parsedItem.noVotes = text;
                }
                expectedItem = 'synthese';
                if (textTrimmed === 'Nombre de votants :') {
                    expectedItem = 'synthese.total';
                } else if (textTrimmed === 'Pour l\'adoption :') {
                    expectedItem = 'synthese.pour';
                } else if (textTrimmed === 'Contre :') {
                    expectedItem = 'synthese.contre';
                }
            } else if (expectedItem && expectedItem === 'annoncevote') {
                parsedItem.isAdopted = text.indexOf('pas adopté') === -1;
                expectedItem = null;
            }
        },
        onclosetag: function(tagname) {
            if (tagname === 'ul') {
                currentVoteDeputy = null;
            }
            if (tagname === 'div') {
                expectedItem = null;
            }
            if (tagname == 'html') {
                // print(parsedItem);
                if (!parsedItem.noVotes) {
                    parsedItem.noVotes = 0;
                }
                if (!parsedItem.totalVotes) {
                    parsedItem.totalVotes = parseInt(parsedItem.noVotes) + parseInt(parsedItem.yesVotes);
                }
                callback(parsedItem);
            }
        }
    }, {decodeEntities: true});
}

module.exports = {
    parse: function(url, content) {
        return new Promise(function(resolve, reject) {
            let parser = ballotParser(url, function(ballot) {
                resolve(ballot);
            });
            parser.write(content);
            parser.end();
        })
    }
}

let print = function(parsedItem) {
    console.log('------------- ');
    console.log(parsedItem.title);
    console.log(parsedItem.date);
    console.log(parsedItem.dateDetailed);
    console.log(parsedItem.totalVotes);
    console.log(parsedItem.yesVotes);
    console.log(parsedItem.noVotes);
    console.log(parsedItem.votes);
    console.log(parsedItem.isAdopted);
    console.log('------------- ');
}
