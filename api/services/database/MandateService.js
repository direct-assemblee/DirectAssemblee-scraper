let DateHelper = require('../helpers/DateHelper.js');

const START_DATE_REGEX = /du\s((0?[1-9]|[12][0-9]|3[01])[/-](0?[1-9]|1[012])[/-]\d{4})/i;
const END_DATE_REGEX = /au\s((0?[1-9]|[12][0-9]|3[01]|1er)[/-](0?[1-9]|1[012])[/-]\d{4})/i;

module.exports = {
    insertMandates: function(mandates, deputyId) {
        return clearMandatesForDeputy(deputyId)
        .then(function(removedMandates) {
            let number = removedMandates ? removedMandates.length : 0;
            return createMandates(mandates, deputyId);
        })
    }
}

let clearMandatesForDeputy = function(deputyId) {
    return Mandate.destroy()
    .where({ deputyId: deputyId });
}

let createMandates = function(mandates, deputyId) {
    let mandatesToInsert = createMandatesModels(mandates, deputyId)
    return Mandate.createEach(mandatesToInsert);
}

let createMandatesModels = function(mandates, deputyId) {
    let mandatesToInsert = [];
    let otherCurrentMandates = mandates.otherCurrentMandates;
    for (let j in otherCurrentMandates) {
        mandatesToInsert.push(createMandateModel(deputyId, otherCurrentMandates[j]));
    }

    let pastDeputyMandates = parsePastMandates(deputyId, mandates.pastDeputyMandates);
    mandatesToInsert = mandatesToInsert.concat(pastDeputyMandates)
    let otherPastGouvMissions = parsePastMandates(deputyId, mandates.otherPastGouvMissions);
    mandatesToInsert = mandatesToInsert.concat(otherPastGouvMissions)
    let otherPastInternationalMissions = parsePastMandates(deputyId, mandates.otherPastInternationalMissions);
    mandatesToInsert = mandatesToInsert.concat(otherPastInternationalMissions)
    return mandatesToInsert;
}

let parsePastMandates = function(deputyId, pastMandates) {
    let mandatesToInsert = [];
    let name = '';
    let previousName = '';
    for (let k in pastMandates) {
        let text = pastMandates[k];
        let startingDateMatched = text.match(START_DATE_REGEX);
        let endingDateMatched = text.match(END_DATE_REGEX);
        let startingDate = '';
        if (startingDateMatched) {
            startingDate = startingDateMatched[1];
        }
        let endingDate = '';
        if (endingDateMatched) {
            endingDate = endingDateMatched[1];
        }

        name = text;
        if (!startingDateMatched && !endingDateMatched) {
            previousName = name;
        }
        if (name.startsWith('du') && (startingDateMatched || endingDateMatched)) {
            name = previousName;
        }

        if (name && startingDate && endingDate) {
            mandatesToInsert.push(createMandateModel(deputyId, name, startingDate, endingDate));
            startingDate = '';
            endingDate = '';
            previousName = name;
            name = '';
        }
    }
    return mandatesToInsert;
}

let createMandateModel = function(deputyId, name, startingDate, endingDate) {
    return {
        'name': removeUnwantedCharacters(name),
        'startingDate': startingDate ? DateHelper.formatDate(startingDate) : '',
        'endingDate': endingDate ? DateHelper.formatDate(endingDate) : '',
        'deputyId': deputyId
    }
}

let removeUnwantedCharacters = function(str) {
    let formattedStr = str.trim() ;
    if (formattedStr.endsWith(':')) {
        formattedStr = formattedStr.substring(0, formattedStr.length - 1);
        formattedStr = formattedStr.trim();
    }
    return formattedStr;
}
