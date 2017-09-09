'use strict';

let Promise = require('bluebird');
let htmlparser = require('htmlparser2');
let DateHelper = require('../helpers/DateHelper.js');

let currentMandatesParser = function(callback) {
    let mandates = [];
    let parsedItem = {};

    let expectedType = '';

    let expectMandates = false;
    let retrieveMandate = false;
    let reallyExpectPreviousDeputiesMandates = false;

    const TAG_CURRENT_MANDATE = 'fonctions-an';
    const TAG_OTHERS = 'autres';
    const TAG_PAST_DEPUTY_MANDATES = 'mandats-an-historique';
    const TAG_PAST_OTHER_GOUV_MISSIONS = 'mandats-nationaux-historique';
    const TAG_PAST_INTL_MISSIONS = 'internationales-judiciaires-historique';

    return new htmlparser.Parser({
        onopentag: function(tagname, attribs) {
            if (tagname === 'div' && attribs.id == TAG_CURRENT_MANDATE) {
                expectedType = attribs.id;
            } else if (tagname === 'div' && (attribs.id == TAG_OTHERS || attribs.id == TAG_PAST_DEPUTY_MANDATES || attribs.id == TAG_PAST_OTHER_GOUV_MISSIONS || attribs.id == TAG_PAST_INTL_MISSIONS)) {
                mandates = [];
                expectedType = attribs.id;
                expectMandates = true;
            } else if (expectedType === TAG_PAST_DEPUTY_MANDATES || expectedType === TAG_PAST_INTL_MISSIONS) {
                if (reallyExpectPreviousDeputiesMandates) {
                    if (attribs.class === 'fonctions-liste-attributs') {
                        retrieveMandate = true;
                    } else if (tagname === 'h4') {
                        reallyExpectPreviousDeputiesMandates = false;
                        retrieveMandate = false;
                    }
                } else if (tagname === 'span') {
                    reallyExpectPreviousDeputiesMandates = true;
                }
            } else if (expectMandates && tagname === 'li') {
                retrieveMandate = true;
            } else if (expectMandates && tagname === 'h4') {
                retrieveMandate = false;
            }
        },
        ontext: function(text) {
            if (expectedType === TAG_CURRENT_MANDATE) {
                let trimmed = text.trim()
                if (trimmed) {
                    let startingDateMatched = DateHelper.findDateInString(trimmed);
                    if (startingDateMatched) {
                        parsedItem.currentMandateStartDate = startingDateMatched;
                        expectedType = null;
                    }
                }
            } else if (expectedType === TAG_PAST_DEPUTY_MANDATES) {
                if (text === 'Mandat de député') {
                    reallyExpectPreviousDeputiesMandates = true;
                }
            }
            if (retrieveMandate) {
                let trimmed = text.trim()
                if (trimmed) {
                    mandates.push(trimmed);
                }
            }
        },
        onclosetag: function(tagname) {
            if (tagname === 'div' && expectMandates) {
                if (expectedType === TAG_OTHERS) {
                    parsedItem.otherCurrentMandates = mandates;
                } else if (expectedType === TAG_PAST_DEPUTY_MANDATES) {
                    parsedItem.pastDeputyMandates = mandates;
                } else if (expectedType === TAG_PAST_OTHER_GOUV_MISSIONS) {
                    parsedItem.otherPastGouvMissions = mandates;
                } else if (expectedType === TAG_PAST_INTL_MISSIONS) {
                    parsedItem.otherPastInternationalMissions = mandates;
                }
                expectMandates = false;
                retrieveMandate = false;
            } else if (tagname === 'h4' || tagname === 'h3') {
                retrieveMandate = false;
            } else if (tagname === 'html') {
                callback(parsedItem);
            }
        }
    }, {decodeEntities: true});
}

module.exports = {
    parse: function(content) {
        return new Promise(function(resolve, reject) {
            let parser = currentMandatesParser(function(mandates) {
                resolve(mandates);
            });
            parser.write(content);
            parser.end();
        })
    }
}

let print = function(parsedItem) {
    console.log('------------- MANDATE');
    console.log('currentMandateStartDate : ' + parsedItem.currentMandateStartDate);
    console.log('otherCurrentMandates : ' + parsedItem.otherCurrentMandates);
    console.log('pastDeputyMandates : ' + parsedItem.pastDeputyMandates);
    console.log('otherPastGouvMissions : ' + parsedItem.otherPastGouvMissions);
    console.log('otherPastInternationalMissions : ' + parsedItem.otherPastInternationalMissions);
    console.log('------------- ');
}
