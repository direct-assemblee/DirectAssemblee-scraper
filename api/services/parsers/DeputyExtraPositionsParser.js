'use strict';

let Promise = require('bluebird');
let htmlparser = require('htmlparser2');

const MULTI_LINE_POSITIONS = [ 'Commissions', 'Délégations et Office' ];

let extraPositionsParser = function(callback) {
    let extraPositions = [];
    let expectExtraPosition = false;
    let expectedExtraPositionValue;
    let expectExtraPositionValue = false;
    let currentExtraPositionValue;

    return new htmlparser.Parser({
        onopentag: function(tagname, attribs) {
            if (tagname === 'h4') {
                expectExtraPosition = true;
                expectedExtraPositionValue = null;
                expectExtraPositionValue = false;
            } else if (tagname === 'span' && MULTI_LINE_POSITIONS.includes(expectedExtraPositionValue)) {
                currentExtraPositionValue = {};
                expectExtraPositionValue = true;
            }
        },
        ontext: function(text) {
            if (expectExtraPosition && (text === 'Bureau' || MULTI_LINE_POSITIONS.includes(text))) {
                expectedExtraPositionValue = text;
                expectExtraPosition = false;
            } else if (expectedExtraPositionValue === 'Bureau') {
                let trimmed = text.trim();
                if (trimmed.length > 0) {
                    let positionEnd = trimmed.indexOf('de l\'Assemblée nationale')
                    extraPositions.push({ 'type': 'bureau', 'position': trimmed.substring(0, positionEnd), 'office': 'Assemblée nationale' });
                    expectedExtraPositionValue = null;
                }
            } else if (MULTI_LINE_POSITIONS.includes(expectedExtraPositionValue) && expectExtraPositionValue) {
                let trimmed = text.trim();
                if (trimmed.length > 0 && currentExtraPositionValue) {
                    if (currentExtraPositionValue.position) {
                        currentExtraPositionValue.office = trimmed;
                    } else {
                        currentExtraPositionValue.position = trimmed;
                    }
                }
            }
        },
        onclosetag: function(tagname) {
            if (tagname === 'ul' && MULTI_LINE_POSITIONS.includes(expectedExtraPositionValue) && expectExtraPositionValue) {
                if (currentExtraPositionValue) {
                    let type;
                    if (expectedExtraPositionValue === 'Commissions') {
                        type = 'commissions';
                    } else {
                        type = 'délégations et office';
                    }
                    extraPositions.push({ 'type': type, 'position': currentExtraPositionValue.position, 'office': currentExtraPositionValue.office });
                    currentExtraPositionValue = null;
                }
            } else if (tagname == 'div') {
                expectedExtraPositionValue = null;
                expectExtraPositionValue = false;
            } else if (tagname === 'html') {
                callback(extraPositions);
            }
        }
    }, {decodeEntities: true});
}

module.exports = {
    parse: function(content) {
        return new Promise(function(resolve, reject) {
            let parser = extraPositionsParser(function(extraPositions) {
                resolve(extraPositions);
            });
            parser.write(content);
            parser.end();
        })
    }
}

let print = function(parsedItems) {
    for (let i in parsedItems) {
        let parsedItem = parsedItems[i];
        console.log('------------- EXTRA POSITIONS');
        console.log('type : ' + parsedItem.type);
        console.log('position : ' + parsedItem.position);
        console.log('office : ' + parsedItem.office);
        console.log('------------- ');
    }
}
