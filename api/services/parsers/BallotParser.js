let DateHelper = require('../helpers/DateHelper.js');
let htmlparser = require('htmlparser2');
let StringHelper = require('../helpers/StringHelper');

const VOTES_DATA_REGEX = /let\spositions=(.+\}\])/i;

module.exports = {
    getParser: function(callback) {
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
                    let votesRegexResult = StringHelper.removeParentReference(text).match(VOTES_DATA_REGEX);
                    if (votesRegexResult) {
                        let votesData = votesRegexResult[1];
                        let votes = JSON.parse(votesData);
                        for (let i in votes) {
                            let voteValue = votes[i].RECTIFICATION ? votes[i].RECTIFICATION : votes[i].POSITION;
                            parsedItem.votes.push({ 'deputy' : { officialId: votes[i].ID_ACTEUR }, 'value' : voteValue })
                        }
                    }
                }
                if (isInteresting(expectedItem, text)) {
                    let lightText = StringHelper.removeParentReference(text);
                    if (lightText && lightText.length > 0) {
                        if (expectedItem === 'vote.firstname') {
                            lightText = lightText.replace('MM.', '').replace('M.', '').replace('Mmes', '').replace('Mme', '')
                            .replace(',', ' ').replace(' et ', ' ').replace(/\(.*\)/, ' ');
                            let firstname = lightText;
                            let particule = getParticule(firstname);
                            if (particule) {
                                firstname = firstname.substring(0, firstname.length - particule.length);
                                currentVoteDeputy.lastname = particule.replace(' ', '') + ' ';
                            }
                            currentVoteDeputy.firstname = firstname.trim();
                        } else if (expectedItem === 'vote.lastname') {
                            let lastname = lightText;
                            if (!currentVoteDeputy.lastname) {
                                currentVoteDeputy.lastname = ''
                            }
                            currentVoteDeputy.lastname = currentVoteDeputy.lastname + lastname;
                            parsedItem.votes.push({ 'deputy': currentVoteDeputy, 'value' : currentVoteValue })
                            currentVoteDeputy = {}
                            expectedItem = 'vote.firstname';
                        } else if (expectedItem === 'date') {
                            parsedItem.dateDetailed = lightText.split('-')[1].trim();
                            let strDate = parsedItem.dateDetailed.split(' ').pop()
                            parsedItem.date = DateHelper.formatDate(strDate);
                            expectedItem = null;
                        } else if (expectedItem === 'title') {
                            parsedItem.title = lightText;
                            expectedItem = null;
                        } else if (expectedItem && expectedItem.startsWith('synthese') && text) {
                            if (expectedItem.endsWith('total')) {
                                parsedItem.totalVotes = lightText;
                            } else if (expectedItem.endsWith('pour')) {
                                parsedItem.yesVotes = lightText;
                            } else if (expectedItem.endsWith('contre')) {
                                parsedItem.noVotes = lightText;
                            }
                            expectedItem = 'synthese';
                            if (lightText === 'Nombre de votants :') {
                                expectedItem = 'synthese.total';
                            } else if (lightText === 'Pour l\'adoption :') {
                                expectedItem = 'synthese.pour';
                            } else if (lightText === 'Contre :') {
                                expectedItem = 'synthese.contre';
                            }
                        } else if (expectedItem && expectedItem === 'annoncevote') {
                            parsedItem.isAdopted = lightText.indexOf('pas adopté') === -1;
                            expectedItem = null;
                        }
                    }
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
                    if (!parsedItem.noVotes) {
                        parsedItem.noVotes = 0;
                    }
                    if (!parsedItem.totalVotes) {
                        parsedItem.totalVotes = parseInt(parsedItem.noVotes) + parseInt(parsedItem.yesVotes);
                    }
                    // print(parsedItem);
                    callback(parsedItem);
                }
            }
        }, {decodeEntities: true});
    }
}

let getParticule = function(firstname) {
    let particules = [ ' de', ' de la', ' au', ' du' ]
    for (let i in particules) {
        let part = particules[i]
        if (firstname.endsWith(part)) {
            return part
        }
    }
    return
}

let isInteresting = function(expectedItem, text) {
    return expectedItem === 'vote.firstname' || expectedItem === 'vote.lastname' || expectedItem === 'date' || expectedItem === 'title' || (expectedItem && expectedItem.startsWith('synthese')) || expectedItem === 'annoncevote';
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
