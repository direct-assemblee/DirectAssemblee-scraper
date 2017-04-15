var Promise = require("bluebird");
var DateHelper = require('../helpers/DateHelper.js');

const START_DATE_REGEX = /du\s((0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4})/i;
const END_DATE_REGEX = /au\s((0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4})/i;

var insertMandates = function(mandates, deputeId) {
  return clearMandatesForDepute(deputeId)
  .then(function(removedMandates) {
    return createMandatesModels(mandates, deputeId)
    .then(function(mandatesToInsert) {
      return createMandates(mandatesToInsert);
    })
  })
}

var clearMandatesForDepute = function(deputeId) {
  return Mandate.destroy()
    .where({ deputeId: deputeId });
}

var createMandatesModels = function(mandates, deputeId) {
  var promises = [];
  var otherCurrentMandates = mandates.otherCurrentMandates;
  for (j in otherCurrentMandates) {
    promises.push(createMandateModel(deputeId, otherCurrentMandates[j]));
  }

  var pastDeputeMandates = parsePastMandates(deputeId, mandates.pastDeputeMandates);
  promises = promises.concat(pastDeputeMandates)
  var otherPastGouvMissions = parsePastMandates(deputeId, mandates.otherPastGouvMissions);
  promises = promises.concat(otherPastGouvMissions)
  var otherPastInternationalMissions = parsePastMandates(deputeId, mandates.otherPastInternationalMissions);
  promises = promises.concat(otherPastInternationalMissions)
  return Promise.all(promises)
}

var parsePastMandates = function(deputeId, pastMandates) {
  var promises = [];
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
      promises.push(createMandateModel(deputeId, name, startingDate, endingDate));
      startingDate = null;
      endingDate = null;
      previousName = name;
      name = null;
    }
  }
  return promises;
}

var createMandateModel = function(deputeId, name, startingDate, endingDate) {
  return Promise.resolve({
    "name": removeUnwantedCharacters(name),
    "startingDate": startingDate ? DateHelper.formatDate(startingDate) : null,
    "endingDate": endingDate ? DateHelper.formatDate(endingDate) : null,
    "deputeId": deputeId
  })
}

var removeUnwantedCharacters = function(str) {
  var formattedStr = str.trim() ;
  if (formattedStr.endsWith(":")) {
    formattedStr = formattedStr.substring(0, formattedStr.length - 1);
    formattedStr = formattedStr.trim();
  }
  return formattedStr;
}

var createMandates = function(mandatesToInsert) {
  var promises = [];
  for (i in mandatesToInsert) {
    promises.push(createMandate(mandatesToInsert[i]));
  }
  return Promise.all(promises)
}

var createMandate = function(mandateToInsert) {
  return Mandate.create(mandateToInsert)
  .then(function(insertedMandate) {
    console.log("created mandate : " + insertedMandate.name + " from " + insertedMandate.startingDate + " to " + insertedMandate.endingDate + " for " + insertedMandate.deputeId);
  });
}

module.exports = {
  insertAllMandates: function(parsedDeputes, insertedDeputes) {
    var promises = [];
		for (i in parsedDeputes) {
			promises.push(insertMandates(parsedDeputes[i].mandates, insertedDeputes[i].id));
		}
		return Promise.all(promises)
  }
}
