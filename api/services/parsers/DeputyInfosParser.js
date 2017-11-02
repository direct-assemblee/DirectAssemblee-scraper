'use strict';

let DateHelper = require('../helpers/DateHelper.js');
let htmlparser = require('htmlparser2');
let StringHelper = require('../helpers/StringHelper');

module.exports = {
    getParser: function(callback) {
        let parsedItem = {};
        let expectedItem;

        return new htmlparser.Parser({
            onopentag: function(tagname, attribs) {
                if (tagname === 'a' && attribs.title && attribs.title.includes('composition du groupe')) {
                    expectedItem = 'parliamentGroup';
                } else if (attribs.class === 'tel') {
                    expectedItem = 'phone';
                } else if (attribs.class === 'email') {
                    parsedItem.email = StringHelper.removeParentReference(attribs.href.replace('mailto:', ''));
                } else if (attribs.href && attribs.href.startsWith('http://www.hatvp.fr')) {
                    parsedItem.declarationsUrl = StringHelper.removeParentReference(attribs.href);
                } else if (tagname === 'dt') {
                    expectedItem = 'birthdateOrJob';
                } else if (tagname === 'div' && attribs.dataplace) {
                    parsedItem.seatNumber = StringHelper.removeParentReference(attribs.dataplace);
                }
            },
            ontext: function(text) {
                if (expectedItem === 'phone') {
                    expectedItem = 'phoneValue'
                } else if (expectedItem === 'birthdateOrJob') {
                    if (text === 'Biographie') {
                        expectedItem = 'birthdate';
                    } else if (text === 'Date de fin de mandat') {
                        expectedItem = 'endOfMandate';
                    }
                } else if (isInteresting(expectedItem, text)) {
                    let lightText = StringHelper.removeParentReference(text);
                    if (lightText && lightText.length > 0) {
                        if (expectedItem === 'phoneValue') {
                            parsedItem.phone = lightText.replace(/\s+/g, '');
                            expectedItem = null;
                        } else if (expectedItem === 'birthdate') {
                            let dateMatched = DateHelper.findAndFormatDateInString(lightText);
                            if (dateMatched) {
                                parsedItem.birthDate = dateMatched;
                                expectedItem = 'job';
                            }
                        } else if (expectedItem === 'job') {
                            parsedItem.job = lightText;
                            expectedItem = null;
                        } else if (expectedItem === 'endOfMandate') {
                            let dateMatched = DateHelper.findAndFormatDateInString(lightText);
                            if (dateMatched && dateMatched.length > 0) {
                                parsedItem.endOfMandateDate = dateMatched[dateMatched.length - 1];
                                let reason = lightText.match(/\((.*)\)/i);
                                if (reason && reason.length > 1) {
                                    parsedItem.endOfMandateReason = reason[1];
                                }
                            }
                        } else if (expectedItem === 'parliamentGroup') {
                            parsedItem.parliamentGroup = lightText;
                        }
                    }
                }
            },
            onclosetag: function(tagname) {
                if (tagname === 'ul') {
                    expectedItem = null;
                } else if (tagname == 'html') {
                    // print(parsedItem);
                    callback(parsedItem);
                }
            }
        }, {decodeEntities: true});
    }
}

let isInteresting = function(expectedItem, text) {
    return expectedItem === 'phoneValue' || expectedItem === 'birthdate' || expectedItem === 'job' || expectedItem === 'endOfMandate' || expectedItem === 'parliamentGroup';
}

let print = function(parsedItem) {
    console.log('------------- DEPUTY');
    console.log('phone : ' + parsedItem.phone);
    console.log('email : ' + parsedItem.email);
    console.log('parliamentGroup : ' + parsedItem.parliamentGroup);
    console.log('job : ' + parsedItem.job);
    console.log('birthdate : ' + parsedItem.birthDate);
    console.log('seatNumber : ' + parsedItem.seatNumber);
    console.log('declarationsUrl : ' + parsedItem.declarationsUrl);
    console.log('endOfMandateDate : ' + parsedItem.endOfMandateDate);
    console.log('endOfMandateReason : ' + parsedItem.endOfMandateReason);
    console.log('------------- ');
}
