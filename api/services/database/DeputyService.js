let DateHelper = require('../helpers/DateHelper.js');

let self = module.exports = {
    findDeputyWithId: function(deputyId) {
        return Deputy.findOne().where({
            officialId: deputyId
        })
    },

    addWorkToDeputy: function(workId, workType, deputyId) {
        if (workType === Constants.DB_WORK_TYPE_QUESTIONS || workType === Constants.DB_WORK_TYPE_PROPOSITIONS) {
            return addWorkCreationIfNew(deputyId, workId)
        } else {
            return addWorkParticipationIfNew(deputyId, workId)
        }
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
        'commission': deputy.commission,
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

let addWorkCreationIfNew = function(deputyId, workId) {
    return hasWorkAsCreation(deputyId, workId)
    .then(function(exists) {
        if (!exists) {
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
    })
}

let addWorkParticipationIfNew = function(deputyId, workId) {
    return hasWorkAsParticipation(deputyId, workId)
    .then(function(exists) {
        if (!exists) {
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
    })
}

let hasWorkAsCreation = function(deputyId, workId) {
    let result = false;
    return Deputy.findOne({ officialId: deputyId })
    .populate('workCreations')
    .then(function(deputy) {
        for (let i in deputy.workCreations) {
            if (deputy.workCreations[i].id == workId) {
                result = true;
                break;
            }
        }
        return result;
    })
}

let hasWorkAsParticipation = function(deputyId, workId) {
    let result = false;
    return Deputy.findOne({ officialId: deputyId })
    .populate('workParticipations')
    .then(function(deputy) {
        for (let i in deputy.workParticipations) {
            if (deputy.workParticipations[i].id == workId) {
                result = true;
                break;
            }
        }
        return result;
    })
}
