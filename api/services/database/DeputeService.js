var Promise = require("bluebird");

var insertDepute = function(depute, shouldUpdate) {
  return Depute.findOne({
    officialId: depute.officialId
  }).then(function(foundDepute) {
    if (!foundDepute || shouldUpdate) {
      return Department.findOne(
        { "name": depute.department }
      ).then(function(department) {
        if (department) {
          return createDeputeModel(depute, department.id)
          .then(function(deputeToInsert) {
            if (!foundDepute) {
              return createDepute(deputeToInsert);
            } else {
              return updateDepute(deputeToInsert);
            }
          })
        } else {
          console.log("didn't find department : " + depute.department);
        }
      })
    }
  });
}

var createDeputeModel = function(depute, departmentId) {
  return Promise.resolve({
    "officialId": depute.officialId,
    "civility": depute.civility,
    "firstname": depute.firstname,
    "lastname": depute.lastname,
    "party": depute.party,
    "departmentId": departmentId,
    "subdepartment": depute.subdepartment,
    "commission": depute.commission
  })
}

var createDepute = function(deputeToInsert) {
  return Depute.create(deputeToInsert)
    .then(function(insertedDepute) {
      // console.log("created depute : " + insertedDepute.lastname + " from " + insertedDepute.departmentId);
      return insertedDepute;
    })
}

var updateDepute = function(deputeToUpdate) {
  return Depute.update({
    officialId: deputeToUpdate.officialId
  }, deputeToUpdate)
  .then(function(updatedDepute) {
    // console.log("updated depute : " + updatedDepute[0].lastname);
    return updatedDepute[0];
  })
}

module.exports = {
  insertAllDeputes: function(deputes) {
    var promises = [];
		for (i in deputes) {
			promises.push(insertDepute(deputes[i], true));
		}
		return Promise.all(promises)
  }
}
