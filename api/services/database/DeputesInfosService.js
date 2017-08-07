var Promise = require("bluebird");

var createDeputeInfosModel = function(deputeInfos) {
    return Promise.resolve({
        "id": deputeInfos.id,
        "fullname": deputeInfos.fullname,
        "lastname": deputeInfos.lastname,
        "firstname": deputeInfos.firstname,
        "genre": deputeInfos.genre,
        "birthdate": deputeInfos.birthdate,
        "birthplace": deputeInfos.birthplace,
        "departmentNumber": deputeInfos.departmentNumber,
        "districtName": deputeInfos.districtName,
        "districtNumber": deputeInfos.districtNumber,
        "mandateStartingDate": deputeInfos.mandateStartingDate,
        "roleInParty": deputeInfos.roleInParty.fonction,
        "partyShort": deputeInfos.partyShort,
        "party": deputeInfos.party,
        "responsabilities": deputeInfos.responsabilities,
        "responsabilities_out_of_parliament": deputeInfos.responsabilities_out_of_parliament,
        "parliament_groups": deputeInfos.parliament_groups,
        "websites": deputeInfos.websites,
        "emails": deputeInfos.emails,
        "addresses": deputeInfos.addresses,
        "previousMandates": deputeInfos.previousMandates,
        "otherMandates": deputeInfos.otherMandates,
        "previousOtherMandates": deputeInfos.previousOtherMandates,
        "job": deputeInfos.job,
        "seat": deputeInfos.seat,
        "officialUrl": deputeInfos.officialUrl,
        "officialId": deputeInfos.officialId,
        "slugName": deputeInfos.slugName,
        "numberOfMandates": deputeInfos.numberOfMandates,
        "twitter": deputeInfos.twitter
    })
}

var createDeputeInfos = function(deputeInfosToInsert) {
    return DeputeInfos.create(deputeInfosToInsert)
    .then(function(insertedDeputeInfos) {
        // console.log("created depute infos: " + insertedDeputeInfos.lastname);
        return insertedDeputeInfos;
    })
}

var updateDeputeInfos = function(deputeInfosToUpdate) {
    return DeputeInfos.update({
        id: deputeInfosToUpdate.id
    }, deputeInfosToUpdate)
    .then(function(updatedDeputeInfos) {
        // console.log("updated depute updatedDeputeInfos : " + updatedDeputeInfos[0].lastname);
        return updatedDeputeInfos[0];
    })
}

var insertDeputeInfos = function(deputeInfos, shouldUpdate) {
    return DeputeInfos.findOne({
        id: deputeInfos.id
    }).then(function(foundDeputeInfos) {
        if (!foundDeputeInfos || shouldUpdate) {
            return createDeputeInfosModel(deputeInfos)
            .then(function(deputeInfosToInsert) {
                if (!foundDeputeInfos) {
                    return createDeputeInfos(deputeInfosToInsert);
                } else {
                    return updateDeputeInfos(deputeInfosToInsert);
                }
            })
        }
    });
}

module.exports = {
    insertAllDeputesInfos: function(deputesInfos) {
        return insertDeputeInfos(deputesInfos, true);
    }
}
