'use strict';

let DateHelper = require('../helpers/DateHelper.js');
let htmlparser = require('htmlparser2');

let deputyParser = function(callback) {
    let parsedItem = {};
    let expectedItem;
    let expectJobTextCount = 0;

    return new htmlparser.Parser({
        onopentag: function(tagname, attribs) {
            if (tagname === 'a' && attribs.title && attribs.title.includes('composition du groupe')) {
                expectedItem = 'parliamentGroup';
            } else if (attribs.class === 'tel') {
                expectedItem = 'phone';
            } else if (attribs.class === 'email') {
                parsedItem.email = attribs.href.replace('mailto:', '')
            } else if (attribs.href && attribs.href.startsWith('http://www.hatvp.fr')) {
                parsedItem.declarationsUrl = attribs.href;
            } else if (tagname === 'dt') {
                expectedItem = 'jobOrEnd';
            } else if (tagname === 'div' && attribs.dataplace) {
                parsedItem.seatNumber = attribs.dataplace;
            }
        },
        ontext: function(text) {
            if (expectedItem === 'phone') {
                expectedItem = 'phoneValue'
            } else if (expectedItem === 'phoneValue') {
                parsedItem.phone = text.replace(/\s+/g, '');
                expectedItem = null;
            } else if (expectedItem === 'jobOrEnd') {
                if (text === 'Biographie') {
                    expectJobTextCount = expectJobTextCount + 1;
                } else if (expectJobTextCount > 0) {
                    let trimmed = text.trim();
                    if (trimmed) {
                        expectJobTextCount = expectJobTextCount + 1;
                        if (expectJobTextCount === 3) {
                            parsedItem.job = trimmed;
                            expectedItem = null;
                            expectJobTextCount = 0;
                        }
                    }
                } else if (text === 'Date de fin de mandat') {
                    expectedItem = 'endOfMandate';
                }
            } else if (expectedItem === 'endOfMandate') {
                let trimmed = text.trim();
                if (trimmed) {
                    let dateMatched = trimmed.match(DateHelper.DATE_REGEX);
                    if (dateMatched && dateMatched.length > 0) {
                        parsedItem.endOfMandateDate = dateMatched[dateMatched.length - 1];
                        let reason = trimmed.match(/\((.*)\)/i);
                        if (reason && reason.length > 1) {
                            parsedItem.endOfMandateReason = reason[1];
                        }
                        // expectedType = null;
                    }
                }
            } else if (expectedItem === 'parliamentGroup') {
                let trimmed = text.trim();
                if (trimmed) {
                    parsedItem.parliamentGroup = trimmed;
                    // expectedType = null;
                }
            }
        },
        onclosetag: function(tagname) {
            if (tagname === 'ul') {
                expectedItem = null;
                expectJobTextCount = 0;
            } else if (tagname == 'html') {
                // print(parsedItem);
                callback(parsedItem);
            }
        }
    }, {decodeEntities: true});
}

module.exports = {
    parse: function(content) {
        return new Promise(function(resolve, reject) {
            let parser = deputyParser(function(deputy) {
                // console.log('   parsed infos OK')
                resolve(deputy);
            });
            parser.write(content);
            parser.end();
        })
    }
}

let print = function(parsedItem) {
    console.log('------------- DEPUTY');
    console.log('phone : ' + parsedItem.phone);
    console.log('email : ' + parsedItem.email);
    console.log('parliamentGroup : ' + parsedItem.parliamentGroup);
    console.log('job : ' + parsedItem.job);
    console.log('seatNumber : ' + parsedItem.seatNumber);
    console.log('declarationsUrl : ' + parsedItem.declarationsUrl);
    console.log('declarationsUrl : ' + parsedItem.declarationsUrl);
    console.log('endOfMandateDate : ' + parsedItem.endOfMandateDate);
    console.log('endOfMandateReason : ' + parsedItem.endOfMandateReason);
    console.log('------------- ');
}
