let WorkTypeService = require('../database/WorkTypeService')

let workTypes;

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

    allTypes: function() {
        return [ self.WORK_OFFICIAL_PATH_QUESTIONS,
            self.WORK_OFFICIAL_PATH_REPORTS,
            self.WORK_OFFICIAL_PATH_PROPOSITIONS,
            self.WORK_OFFICIAL_PATH_COSIGNED_PROPOSITIONS,
            self.WORK_OFFICIAL_PATH_COMMISSIONS,
            self.WORK_OFFICIAL_PATH_PUBLIC_SESSIONS ]
    },

    getWorkTypeId: async function(searchedTypeNameOrId) {
        if (!workTypes) {
            workTypes = await WorkTypeService.findAllWorkTypes()
        }
        return findCorrectId(workTypes, searchedTypeNameOrId)
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

let findCorrectId = function(referenceTypes, searchedTypeNameOrId) {
    let id;
    for (let i in referenceTypes) {
        if (isCorrectType(referenceTypes[i], searchedTypeNameOrId)) {
            id = referenceTypes[i].id
            break;
        }
    }
    return id
}

let isCorrectType = function(referenceType, searchedTypeNameOrId) {
    return searchedTypeNameOrId == referenceType.id
        || (typeof searchedTypeNameOrId === 'string' && searchedTypeNameOrId.startsWith(referenceType.officialPath))
}
