var Promise = require("bluebird");

var createLawModel = function(law) {
  return Promise.resolve({
    "officialId": law.officialId,
    "title": law.title,
    "date": law.date,
    "detailedDate": law.dateDetailed
  })
}

var createLaw = function(lawToInsert) {
  return Law.create(lawToInsert)
  .then(function(insertedLaw) {
    // console.log("created law : " + insertedLaw.id);
    return insertedLaw;
  })
}

var updateLaw = function(lawToUpdate) {
  return Law.update({
    officialId: lawToUpdate.officialId
  }, lawToUpdate)
  .then(function(updatedLaw) {
    // console.log("updated law : " + updatedLaw[0].id);
    return updatedLaw[0];
  })
}

module.exports = {
  checkIfLawExists: function(lawId, callback) {
    return Law.findOne({
      officialId: lawId
    }).then(function(law) {
      return law != undefined;
    })
  },

  insertLaw: function(law, shouldUpdate) {
    return Law.findOne({
      officialId: law.officialId
    }).then(function(foundLaw) {
      if (!foundLaw || shouldUpdate) {
        return createLawModel(law)
        .then(function(lawToInsert) {
          if (!foundLaw) {
            return createLaw(lawToInsert);
          } else {
            return updateLaw(lawToInsert);
          }
        })
      }
    });
  }
}
