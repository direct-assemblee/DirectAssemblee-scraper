var Promise = require("bluebird");
var DateHelper = require('../helpers/DateHelper.js');

var self = module.exports = {
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
      var simplifiedDeputies = [];
      for (i in deputies) {
        var deputy = deputies[i];
        simplifiedDeputies.push({ id: deputy.id, firstname: deputy.firstname, lastname: deputy.lastname });
      }
      return simplifiedDeputies;
    })
  },

  insertDeputy: function(deputy, shouldUpdate) {
    return self.findDeputyWithOfficialId(deputy.officialId)
    .then(function(foundDeputy) {
      if (!foundDeputy || shouldUpdate) {
        return Department.findOne(
          { "name": deputy.department }
        ).then(function(department) {
          if (department) {
            var deputyToInsert = createDeputyModel(deputy, department.id)
            if (!foundDeputy) {
              return createDeputy(deputyToInsert);
            } else {
              return updateDeputy(deputyToInsert);
            }
          } else {
            console.log("didn't find department : " + deputy.department);
          }
        })
      }
    });
  },

  saveEndOfMandate: function(deputy) {
    var endingDate = deputy.endOfMandateDate ? DateHelper.formatDate(deputy.endOfMandateDate) : null;
    var toUpdate = {
      "currentMandateStartDate": null,
      "mandateEndDate": endingDate,
      "mandateEndReason": deputy.endOfMandateReason
    };
    return Deputy.update({
      officialId: deputy.officialId
    }, toUpdate)
    .then(function(updatedDeputy) {
      // console.log("updated deputy : " + updatedDeputy[0].lastname);
      return updatedDeputy[0];
    })
  }
}

var createDeputyModel = function(deputy, departmentId) {
  var startingDate = deputy.currentMandateStartDate ? DateHelper.formatDate(deputy.currentMandateStartDate) : null;
  return {
    "officialId": deputy.officialId,
    "gender": deputy.civility === "M." ? "M" : "F",
    "firstname": deputy.firstname,
    "lastname": deputy.lastname,
    "parliamentGroup": deputy.parliamentGroup,
    "departmentId": departmentId,
    "district": deputy.district,
    "commission": deputy.commission,
    "phone": deputy.phone,
    "email": deputy.email,
    "job": deputy.job,
    "currentMandateStartDate": startingDate,
    "seatNumber" : deputy.seatNumber,
    "mandateEndDate": null,
    "mandateEndReason": null
  }
}

var createDeputy = function(deputyToInsert) {
  return Deputy.create(deputyToInsert)
    .then(function(insertedDeputy) {
      // console.log("created deputy : " + insertedDeputy.lastname + " from " + insertedDeputy.departmentId);
      return insertedDeputy;
    })
}

var updateDeputy = function(deputyToUpdate) {
  return Deputy.update({
    officialId: deputyToUpdate.officialId
  }, deputyToUpdate)
  .then(function(updatedDeputy) {
    // console.log("updated deputy : " + updatedDeputy[0].lastname);
    return updatedDeputy[0];
  })
}
