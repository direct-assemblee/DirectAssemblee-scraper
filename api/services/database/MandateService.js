var Promise = require("bluebird");
var DateHelper = require('../helpers/DateHelper.js');

const START_DATE_REGEX = /du\s((0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4})/i;
const END_DATE_REGEX = /au\s((0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4})/i;

module.exports = {
  insertMandates: function(mandates, deputyId) {
    return clearMandatesForDeputy(deputyId)
    .then(function(removedMandates) {
      return createMandates(mandates, deputyId);
    })
  }
}

var clearMandatesForDeputy = function(deputyId) {
  return Mandate.destroy()
    .where({ deputyId: deputyId });
}

var createMandates = function(mandates, deputyId) {
  var mandatesToInsert = createMandatesModels(mandates, deputyId)
  return Mandate.create(mandatesToInsert)
  .then(function(insertedMandates) {
    for (i in insertedMandates) {
      // console.log("created mandate : " + insertedMandates[i].name + " from " + insertedMandates[i].startingDate + " to " + insertedMandates[i].endingDate + " for " + insertedMandates[i].deputyId);
    }
    return insertedMandates;
  });
}

var createMandatesModels = function(mandates, deputyId) {
  var mandatesToInsert = [];
  var otherCurrentMandates = mandates.otherCurrentMandates;
  for (j in otherCurrentMandates) {
    mandatesToInsert.push(createMandateModel(deputyId, otherCurrentMandates[j]));
  }

  var pastDeputyMandates = parsePastMandates(deputyId, mandates.pastDeputyMandates);
  mandatesToInsert = mandatesToInsert.concat(pastDeputyMandates)
  var otherPastGouvMissions = parsePastMandates(deputyId, mandates.otherPastGouvMissions);
  mandatesToInsert = mandatesToInsert.concat(otherPastGouvMissions)
  var otherPastInternationalMissions = parsePastMandates(deputyId, mandates.otherPastInternationalMissions);
  mandatesToInsert = mandatesToInsert.concat(otherPastInternationalMissions)
  return mandatesToInsert;
}

var parsePastMandates = function(deputyId, pastMandates) {
  var mandatesToInsert = [];
  var name = "";
  var previousName = "";
  for (k in pastMandates) {
    var text = pastMandates[k];
    var startingDateMatched = text.match(START_DATE_REGEX);
    var endingDateMatched = text.match(END_DATE_REGEX);
    var startingDate = "";
    if (startingDateMatched) {
      startingDate = startingDateMatched[1];
    }
    var endingDate = "";
    if (endingDateMatched) {
      endingDate = endingDateMatched[1];
    }

    name = text;
    if (!startingDateMatched && !endingDateMatched) {
      previousName = name;
    }
    if (name.startsWith("du") && (startingDateMatched || endingDateMatched)) {
      name = previousName;
    }

    if (name && startingDate && endingDate) {
      mandatesToInsert.push(createMandateModel(deputyId, name, startingDate, endingDate));
      startingDate = null;
      endingDate = null;
      previousName = name;
      name = null;
    }
  }
  return mandatesToInsert;
}

var createMandateModel = function(deputyId, name, startingDate, endingDate) {
  return {
    "name": removeUnwantedCharacters(name),
    "startingDate": startingDate ? DateHelper.formatDate(startingDate) : null,
    "endingDate": endingDate ? DateHelper.formatDate(endingDate) : null,
    "deputyId": deputyId
  }
}

var removeUnwantedCharacters = function(str) {
  var formattedStr = str.trim() ;
  if (formattedStr.endsWith(":")) {
    formattedStr = formattedStr.substring(0, formattedStr.length - 1);
    formattedStr = formattedStr.trim();
  }
  return formattedStr;
}
