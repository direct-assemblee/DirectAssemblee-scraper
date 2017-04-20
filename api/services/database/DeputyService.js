var Promise = require("bluebird");

module.exports = {
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
    return Deputy.findOne({
      officialId: deputy.officialId
    }).then(function(foundDeputy) {
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
  }
}

var createDeputyModel = function(deputy, departmentId) {
  return {
    "officialId": deputy.officialId,
    "gender": deputy.civility === "M." ? "M" : "F",
    "firstname": deputy.firstname,
    "lastname": deputy.lastname,
    "party": deputy.party,
    "departmentId": departmentId,
    "circonscription": deputy.circonscription,
    "commission": deputy.commission,
    "phone": deputy.phone,
    "email": deputy.email,
    "job": deputy.job
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
