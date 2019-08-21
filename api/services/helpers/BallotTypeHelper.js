let BallotTypeService = require('../database/BallotTypeService')

let ballotTypes;

let self = module.exports = {
    BALLOT_SOLEMN: 'Scrutin solennel',
    BALLOT_ORDINARY: 'Scrutin ordinaire',
    BALLOT_MOTION: 'Motion de censure',
    BALLOT_OTHER: 'Autre scrutin',
    BALLOT_UNDEFINED: 'Scrutin (type à venir)',
    BALLOT_OFFICIAL_TYPE_ORDINARY: 'SOR',
    BALLOT_OFFICIAL_TYPE_SOLEMN: 'SSO',
    BALLOT_OFFICIAL_TYPE_OTHER: 'AUT',
    BALLOT_OFFICIAL_TYPE_MOTION: 'MOT',
    BALLOT_OFFICIAL_TYPE_UNDEFINED: 'UND',
    BALLOT_OFFICIAL_TYPE_ALL: 'TOUS',

    allTypes: function() {
        return [ self.BALLOT_OFFICIAL_TYPE_ORDINARY,
            self.BALLOT_OFFICIAL_TYPE_SOLEMN,
            self.BALLOT_OFFICIAL_TYPE_OTHER,
            self.BALLOT_OFFICIAL_TYPE_ALL ]
    },

    getBallotTypeId: async function(searchedType) {
        if (!ballotTypes) {
            ballotTypes = await BallotTypeService.findAllBallotTypes()
        }
        return findCorrectId(ballotTypes, searchedType)
    }
}

let findCorrectId = function(referenceTypes, searchedType) {
    let id;
    for (let i in referenceTypes) {
        if (isCorrectType(referenceTypes[i], searchedType)) {
            id = referenceTypes[i].id
            break;
        }
    }
    return id
}

let isCorrectType = function(referenceType, searchedType) {
    return searchedType.startsWith(referenceType.officialPath)
}
