'use strict';

let Promise = require('bluebird');
let htmlparser = require('htmlparser2');
let DateHelper = require('../helpers/DateHelper.js');
let StringHelper = require('../helpers/StringHelper');

const INSTANCE_ID_PREFIX = 'OMC_PO'
const TAG_CURRENT_MANDATE = 'fonctions-an';
const TAG_OTHERS = 'autres';
const TAG_PAST_DEPUTY_MANDATES = 'mandats-an-historique';
const TAG_PAST_OTHER_GOUV_MISSIONS = 'mandats-nationaux-historique';
const TAG_PAST_INTL_MISSIONS = 'internationales-judiciaires-historique';

const MULTI_LINE_POSITIONS = [ 'Commissions', 'Délégations et Office' ];

module.exports = {
    getParser: function(callback) {
        let parsedInstances = [];
        let expectInstance = false;
        let expectedItemForInstance;
        let parsedRole
        let parsedType
        let parsedInstance = {};
        let commissionCount = 0;

        let mandates = [];
        let mandatesGroup = {};
        let expectedTypeForMandates = '';
        let expectMandates = false;
        let retrieveMandate = false;
        let reallyExpectPreviousDeputiesMandates = false;

        let extraPosition;
        let expectExtraPosition = false;
        let expectExtraPositionValue = false;

        let infos = {};
        let expectedItemForInfos;

        let onOpenTagForInstances = function(tagname, attribs) {
            if (attribs.class === 'bordure-top') {
                expectInstance = true;
                expectedItemForInstance = 'type'
            } else if (expectInstance && attribs.href != null && attribs.href.startsWith('/instances/')) {
                let lightText = StringHelper.removeParentReference(attribs.href);
                let start = lightText.indexOf(INSTANCE_ID_PREFIX)
                lightText = lightText.substring(start + INSTANCE_ID_PREFIX.length)
                parsedInstance.officialId = lightText
                expectedItemForInstance = 'name'
            } else if (expectInstance && tagname === 'span' && attribs.class === 'dt') {
                expectedItemForInstance = 'role'
            }
        }

        let onTextForInstances = function(text) {
            if (expectedItemForInstance != null) {
                let lightText = StringHelper.removeParentReference(text);
                if (lightText != null && lightText.length > 0) {
                    if (expectedItemForInstance === 'role') {
                        parsedRole = lightText
                        expectedItemForInstance = null;
                    } else if (expectedItemForInstance === 'type') {
                        parsedType = lightText
                    } else if (expectedItemForInstance === 'name') {
                        parsedInstance.name = lightText
                        parsedInstance.role = parsedRole
                        parsedInstance.type = { name: parsedType }
                        if (parsedType === "Commissions") {
                            parsedInstance.type.permanentCommission = commissionCount == 0
                            commissionCount++
                        }
                        parsedInstances.push(parsedInstance);
                        expectedItemForInstance = null;
                        parsedInstance = {}
                    }
                }
            }
        }

        let onCloseTagForInstances = function(tagname) {
            if (tagname === 'div') {
                expectedItemForInstance = null;
            }
        }

        let onOpenTagForExtraPosition = function(tagname, attribs) {
            if (attribs.class === 'bordure-top') {
                expectExtraPosition = true;
            } else if (tagname === 'li' && expectExtraPositionValue) {
                expectExtraPosition = false;
                expectExtraPositionValue = true;
            }
        }

        let onTextForExtraPosition = function(text) {
            if (expectExtraPosition || expectExtraPositionValue) {
                let lightText = StringHelper.removeParentReference(text);
                if (lightText != null && lightText.length > 0) {
                    if (expectExtraPosition && lightText === 'Bureau') {
                        expectExtraPositionValue = true;
                    } else if (expectExtraPositionValue) {
                        let positionEnd = lightText.indexOf('de l\'Assemblée nationale')
                        extraPosition = { 'position': lightText.substring(0, positionEnd) };
                        expectExtraPositionValue = false;
                        expectExtraPosition = false;
                    }
                }
            }
        }

        let onOnOpenTagForMandates = function(tagname, attribs) {
            if (tagname === 'div' && attribs.id == TAG_CURRENT_MANDATE) {
                expectedTypeForMandates = attribs.id;
            } else if (tagname === 'div' && (attribs.id == TAG_OTHERS || attribs.id == TAG_PAST_DEPUTY_MANDATES || attribs.id == TAG_PAST_OTHER_GOUV_MISSIONS || attribs.id == TAG_PAST_INTL_MISSIONS)) {
                mandates = [];
                expectedTypeForMandates = attribs.id;
                expectMandates = true;
            } else if (expectedTypeForMandates === TAG_PAST_DEPUTY_MANDATES || expectedTypeForMandates === TAG_PAST_INTL_MISSIONS) {
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
        }

        let onTextForMandates = function(text) {
            if (expectedTypeForMandates === TAG_CURRENT_MANDATE || expectedTypeForMandates === TAG_PAST_DEPUTY_MANDATES || retrieveMandate) {
                let lightText = StringHelper.removeParentReference(text.trim());
                if (lightText && lightText.length > 0) {
                    if (expectedTypeForMandates === TAG_CURRENT_MANDATE) {
                        let startingDateMatched = DateHelper.findAndFormatDateInString(lightText);
                        if (startingDateMatched) {
                            mandatesGroup.currentMandateStartDate = startingDateMatched;
                            expectedTypeForMandates = null;
                        }
                    } else if (expectedTypeForMandates === TAG_PAST_DEPUTY_MANDATES) {
                        if (lightText === 'Mandat de député') {
                            reallyExpectPreviousDeputiesMandates = true;
                        }
                    }
                    if (retrieveMandate) {
                        mandates.push(lightText);
                    }
                }
            }
        }

        let onCloseTagForMandates = function(tagname) {
            if (tagname === 'div' && expectMandates) {
                if (expectedTypeForMandates === TAG_OTHERS) {
                    mandatesGroup.otherCurrentMandates = mandates;
                } else if (expectedTypeForMandates === TAG_PAST_DEPUTY_MANDATES) {
                    mandatesGroup.pastDeputyMandates = mandates;
                } else if (expectedTypeForMandates === TAG_PAST_OTHER_GOUV_MISSIONS) {
                    mandatesGroup.otherPastGouvMissions = mandates;
                } else if (expectedTypeForMandates === TAG_PAST_INTL_MISSIONS) {
                    mandatesGroup.otherPastInternationalMissions = mandates;
                }
                expectMandates = false;
                retrieveMandate = false;
            } else if (tagname === 'h4' || tagname === 'h3') {
                retrieveMandate = false;
            }
        }

        let onOpenTagForInfos = function(tagname, attribs) {
            if (tagname === 'a' && attribs.title && attribs.title.includes('composition du groupe')) {
                expectedItemForInfos = 'parliamentGroup';
            } else if (attribs.class === 'tel') {
                expectedItemForInfos = 'phone';
            } else if (attribs.class === 'email') {
                infos.email = StringHelper.removeParentReference(attribs.href.replace('mailto:', ''));
            } else if (attribs.href && attribs.href.startsWith('http://www.hatvp.fr')) {
                infos.declarationsUrl = StringHelper.removeParentReference(attribs.href);
            } else if (tagname === 'dt') {
                expectedItemForInfos = 'birthdateOrJob';
            } else if (tagname === 'div' && attribs.dataplace) {
                infos.seatNumber = StringHelper.removeParentReference(attribs.dataplace);
            }
        }

        let onTextForInfos = function(text) {
            if (expectedItemForInfos === 'phone') {
                expectedItemForInfos = 'phoneValue'
            } else if (expectedItemForInfos === 'birthdateOrJob') {
                if (text === 'Biographie') {
                    expectedItemForInfos = 'birthdate';
                } else if (text === 'Date de fin de mandat') {
                    expectedItemForInfos = 'endOfMandate';
                }
            } else if (isInterestingForInfos(expectedItemForInfos, text)) {
                let lightText = StringHelper.removeParentReference(text);
                if (lightText && lightText.length > 0) {
                    if (expectedItemForInfos === 'phoneValue') {
                        infos.phone = lightText.replace(/\s+/g, '');
                        expectedItemForInfos = null;
                    } else if (expectedItemForInfos === 'birthdate') {
                        let dateMatched = DateHelper.findAndFormatDateInString(lightText);
                        if (dateMatched) {
                            infos.birthDate = dateMatched;
                            expectedItemForInfos = 'job';
                        }
                    } else if (expectedItemForInfos === 'job') {
                        infos.job = lightText;
                        expectedItemForInfos = null;
                    } else if (expectedItemForInfos === 'endOfMandate') {
                        let dateMatched = DateHelper.findAndFormatDateInString(lightText);
                        if (dateMatched && dateMatched.length > 0) {
                            infos.endOfMandateDate = dateMatched[dateMatched.length - 1];
                            let reason = lightText.match(/\((.*)\)/i);
                            if (reason && reason.length > 1) {
                                infos.endOfMandateReason = reason[1];
                            }
                        }
                    } else if (expectedItemForInfos === 'parliamentGroup') {
                        infos.parliamentGroup = lightText;
                    }
                }
            }
        }

        let isInterestingForInfos = function(expectedItem, text) {
            return expectedItem === 'phoneValue' || expectedItem === 'birthdate' || expectedItem === 'job' || expectedItem === 'endOfMandate' || expectedItem === 'parliamentGroup';
        }

        let onCloseTagForInfos = function(tagname) {
            if (tagname === 'ul') {
                expectedItemForInfos = null;
            }
        }

        return new htmlparser.Parser({
            onopentag: function(tagname, attribs) {
                onOpenTagForInstances(tagname, attribs);
                onOnOpenTagForMandates(tagname, attribs);
                onOpenTagForExtraPosition(tagname, attribs);
                onOpenTagForInfos(tagname, attribs);
            },
            ontext: function(text) {
                onTextForInstances(text);
                onTextForMandates(text);
                onTextForExtraPosition(text);
                onTextForInfos(text);
            },
            onclosetag: function(tagname) {
                onCloseTagForInstances(tagname);
                onCloseTagForMandates(tagname);
                onCloseTagForInfos(tagname);
                if (tagname === 'html') {
                    callback({ instances: parsedInstances, mandates: mandatesGroup, extraPosition: extraPosition, infos: infos });
                }
            }
        }, {decodeEntities: true});
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
