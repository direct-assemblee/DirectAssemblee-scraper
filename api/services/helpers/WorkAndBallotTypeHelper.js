let WorkTypeService = require('../database/WorkTypeService')
let BallotTypeService = require('../database/BallotTypeService')

let workTypes;
let ballotTypes;

let self = module.exports = {
    QUESTION: 'Question',
    REPORT: 'Rapport',
    PROPOSITION: 'Proposition',
    COMMISSION: 'Commission',
    PUBLIC_SESSION: 'Séance publique',
    WORK_OFFICIAL_PATH_QUESTIONS: 'Questions',
    WORK_OFFICIAL_PATH_REPORTS: 'RapportsParlementaires',
    WORK_OFFICIAL_PATH_PROPOSITIONS: 'PropositionsLoi',
    WORK_OFFICIAL_PATH_COSIGNED_PROPOSITIONS: 'PropositionsLoiCoSignataire',
    WORK_OFFICIAL_PATH_COMMISSIONS: 'ComptesRendusCommission',
    WORK_OFFICIAL_PATH_PUBLIC_SESSIONS: 'ComptesRendusSeance',

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

    getWorkTypeId: async function(searchedType) {
        if (!workTypes) {
            workTypes = await WorkTypeService.findAllWorkTypes()
        }
        return findCorrectId(workTypes, searchedType)
    },

    getBallotTypeId: async function(searchedType) {
        if (!ballotTypes) {
            ballotTypes = await BallotTypeService.findAllBallotTypes()
        }
        return findCorrectId(ballotTypes, searchedType)
    },

    isPublicSession: function(workType) {
        return workType == self.WORK_OFFICIAL_PATH_PUBLIC_SESSIONS
    },

    isQuestion: function(workType) {
        return workType == self.WORK_OFFICIAL_PATH_QUESTIONS
    },

    isCommission: function(workType) {
        return workType == self.WORK_OFFICIAL_PATH_COMMISSIONS
    },

    isProposition: function(workType) {
        return workType == self.WORK_OFFICIAL_PATH_PROPOSITIONS || workType == self.WORK_OFFICIAL_PATH_COSIGNED_PROPOSITIONS
    },

    isCreation: function(workType) {
        return self.isQuestion(workType) || workType == self.WORK_OFFICIAL_PATH_PROPOSITIONS
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
