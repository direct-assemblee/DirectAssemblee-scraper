let DateHelper = require('../helpers/DateHelper.js');
let Promise = require('bluebird')

let self = module.exports = {
    findDeputyWithId: function(deputyId) {
        return Deputy.findOne().where({
            officialId: deputyId
        })
    },

    addWorksToDeputy: async function(works, deputyId) {
        let creations = await findWorks(deputyId, 'workCreations')
        let participations = await findWorks(deputyId, 'workParticipations')

        return Promise.mapSeries(works, function(work) {
            if (work.isCreation) {
                return addWorkCreationIfNew(deputyId, work.id, creations)
            } else {
                return addWorkParticipationIfNew(deputyId, work.id, participations)
            }
        }, { concurrency: 1 })
    },

    findDeputyWithWorks: function(deputyId) {
        return Deputy.findOne({ officialId: deputyId })
        .populate('workCreations')
        .populate('workParticipations')
    },

    findNonUpdatedDeputies: function() {
        return Deputy.find()
        .where({ updatedAt: { '<': DateHelper.yesterday() } });
    },

    findDeputyWithOfficialId: function(officialId) {
        return Deputy.findOne({
            officialId: officialId
        })
    },

    getDeputiesNames: function() {
        return Deputy.find()
        .then(function(deputies) {
            let simplifiedDeputies = [];
            for (let i in deputies) {
                let deputy = deputies[i];
                simplifiedDeputies.push({ officialId: deputy.officialId, firstname: deputy.firstname, lastname: deputy.lastname });
            }
            return simplifiedDeputies;
        })
    },

    insertDeputy: function(deputy, shouldUpdate) {
        return self.findDeputyWithOfficialId(deputy.officialId)
        .then(function(foundDeputy) {
            if (!foundDeputy || shouldUpdate) {
                return Department.findOne(
                    { 'name': deputy.department }
                ).then(function(department) {
                    if (department) {
                        let deputyToInsert = createDeputyModel(deputy, department.id)
                        if (!foundDeputy) {
                            return createDeputy(deputyToInsert);
                        } else {
                            return updateDeputy(deputyToInsert);
                        }
                    } else {
                        console.log('didn\'t find department : ' + deputy.department);
                    }
                })
            }
        });
    },

    saveEndOfMandate: function(deputy) {
        let endingDate = deputy.endOfMandateDate ? DateHelper.formatDate(deputy.endOfMandateDate) : null;
        let toUpdate = {
            'currentMandateStartDate': '',
            'mandateEndDate': endingDate,
            'mandateEndReason': deputy.endOfMandateReason
        };
        return Deputy.update({
            officialId: deputy.officialId
        }, toUpdate)
        .then(function() {
            return;
        })
        .catch(err => {
            console.log('Error updating deputy ' + err);
            return
        });
    }
}

let createDeputyModel = function(deputy, departmentId) {
    return {
        'officialId': deputy.officialId,
        'gender': deputy.civility === 'M.' ? 'M' : 'F',
        'firstname': deputy.firstname,
        'lastname': deputy.lastname,
        'birthDate': deputy.birthDate,
        'parliamentGroup': deputy.parliamentGroup,
        'departmentId': departmentId,
        'district': deputy.district,
        'phone': deputy.phone,
        'email': deputy.email,
        'job': deputy.job,
        'currentMandateStartDate': deputy.currentMandateStartDate,
        'seatNumber' : deputy.seatNumber,
        'mandateEndDate': '',
        'mandateEndReason': ''
    }
}

let createDeputy = function(deputyToInsert) {
    return Deputy.create(deputyToInsert);
}

let updateDeputy = function(deputyToUpdate) {
    return Deputy.update({
        officialId: deputyToUpdate.officialId
    }, deputyToUpdate);
}

let addWorkCreationIfNew = function(deputyId, workId, works) {
    if (!hasWork(deputyId, workId, works)) {
        return Deputy.addToCollection(deputyId, 'workCreations')
        .members(workId)
        .then(function() {
            return;
        })
        .catch(err => {
            console.log('-- Error adding creation ' + err);
            return
        });
    }
}

let addWorkParticipationIfNew = function(deputyId, workId, works) {
    if (!hasWork(deputyId, workId, works)) {
        return Deputy.addToCollection(deputyId, 'workParticipations')
        .members(workId)
        .then(function() {
            return;
        })
        .catch(err => {
            console.log('-- Error adding participation ' + err);
            return
        });
    }
}

let findWorks = function(deputyId, workType) {
    return Deputy.findOne({ officialId: deputyId })
    .populate(workType)
    .then(function(deputy) {
        return deputy[workType];
    })
}

let hasWork = function(deputyId, workId, works) {
    let result = false;
    for (let i in works) {
        if (works[i].id == workId) {
            result = true;
            break;
        }
    }
    return result;
}
