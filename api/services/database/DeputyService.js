let DateHelper = require('../helpers/DateHelper.js');

let self = module.exports = {
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
        .then(function(updatedDeputy) {
            return updatedDeputy[0];
        })
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
    return Deputy.create(deputyToInsert)
    .meta({fetch: true});
}

let updateDeputy = function(deputyToUpdate) {
    return Deputy.update({
        officialId: deputyToUpdate.officialId
    }, deputyToUpdate)
    .meta({fetch: true})
    .then(function(updatedDeputies) {
        // console.log('updated deputy : ' + updatedDeputy[0].lastname);
        return updatedDeputies[0];
    });
}
