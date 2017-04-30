var Promise = require("bluebird");
var Constants = require('./Constants.js')

var DeputiesListParser = require('./parsers/DeputiesListParser');
var DeputyWorkParser = require('./parsers/DeputyWorkParser');
var DeputyInfosParser = require('./parsers/DeputyInfosParser');
var DeputyDeclarationsParser = require('./parsers/DeputyDeclarationsParser');
var DeputyMandatesParser = require('./parsers/DeputyMandatesParser');
var DeputyExtraPositionsParser = require('./parsers/DeputyExtraPositionsParser');

const PARAM_WORK_TYPE = "{work_type}";
const PARAM_DEPUTE_NAME = "{depute_name}";
const WORK_TYPE_QUESTIONS = "Questions";
const WORK_TYPE_REPORTS = "RapportsParlementaires";
const WORK_TYPE_PROPOSITIONS = "PropositionsLoi";
const WORK_TYPE_COSIGNED_PROPOSITIONS = "PropositionsLoiCoSignataire";
const WORK_TYPES = [ WORK_TYPE_QUESTIONS, WORK_TYPE_REPORTS, WORK_TYPE_PROPOSITIONS, WORK_TYPE_COSIGNED_PROPOSITIONS ]
const WORK_PAGE_SIZE = 10;
const DEPUTY_WORK_URL = Constants.BASE_URL + "deputes/documents_parlementaires/(offset)/" + Constants.PARAM_OFFSET + "/(id_omc)/OMC_PA" + Constants.PARAM_DEPUTY_ID + "/(type)/" + PARAM_WORK_TYPE;
const DEPUTY_DECLARATIONS_URL = "http://www.hatvp.fr/fiche-nominative/?declarant=" + PARAM_DEPUTE_NAME;

module.exports = {
  retrieveDeputiesList: function() {
    return FetchUrlService.retrieveContent(Constants.DEPUTIES_LIST_URL)
    .then(function(content) {
      return DeputiesListParser.parse(content)
    })
  },

  retrieveDeputies: function(deputies) {
    return retrieveDeputiesForRange(deputies)
    .then(function(deputies) {
      return deputies;
    })
  }
}

var retrieveDeputiesForRange = function(deputies) {
  var promises = [];
  for (var i = 0 ; i < deputies.length ; i++) {
    promises.push(retrieveDeputyDetails(deputies[i], i));
  }
  return Promise.all(promises);
}

var retrieveDeputyDetails = function(deputy, i) {
  return retrieveDeputyWork(deputy)
  .then(function(deputyWork) {
    deputy.works = []
    for (i in deputyWork) {
      deputy.works = deputy.works.concat(deputyWork[i])
    }
    console.log("retrieved works for : " + deputy.lastname);
    return deputy;
  })
  .then(function(deputy) {
    return retrieveDeputyInfosAndMandates(deputy)
  })
  .then(function(deputy) {
    console.log("retrieved all from deputy " + deputy.lastname)
    return deputy
  })
}

var retrieveDeputyWork = function(deputy) {
  var promises = [];
  for (var i = 0 ; i < WORK_TYPES.length ; i++) {
    promises.push(retrieveDeputyWorkOfType(deputy, WORK_TYPES[i], 0, []))
  }
  return Promise.all(promises);
}

var retrieveDeputyWorkOfType = function(deputy, workType, pageOffset, previousWork) {
  var workUrl = DEPUTY_WORK_URL.replace(Constants.PARAM_DEPUTY_ID, deputy.officialId).replace(Constants.PARAM_OFFSET, pageOffset * WORK_PAGE_SIZE).replace(PARAM_WORK_TYPE, workType);
  return FetchUrlService.retrieveContent(workUrl)
  .then(function(content) {
    return DeputyWorkParser.parse(content, workUrl)
  })
  .then(function(works) {
    var work;
    for (var i in works) {
      work = works[i];
      work.type = getTypeName(workType);
      previousWork.push(work);
    }
    var lastWork = previousWork[previousWork.length - 1];
    if (lastWork && works && works.length >= WORK_PAGE_SIZE && pageOffset < 1) {
      var newOffset = pageOffset + 1;
      return retrieveDeputyWorkOfType(deputy, workType, newOffset, previousWork);
    } else {
      return Promise.resolve(previousWork);
    }
  })
}

var getTypeName = function(workType) {
  var typeName;
  switch (workType) {
    case WORK_TYPE_QUESTIONS:
      typeName = "question";
      break;
    case WORK_TYPE_REPORTS:
      typeName = "report";
      break;
    case WORK_TYPE_PROPOSITIONS:
      typeName = "law_proposal";
      break;
    case WORK_TYPE_COSIGNED_PROPOSITIONS:
      typeName = "cosigned_law_proposal";
      break;
  }
  return typeName;
}

var retrieveDeputyInfosAndMandates = function(deputy) {
  var mandatesUrl = Constants.DEPUTY_INFO_URL.replace(Constants.PARAM_DEPUTY_ID, deputy.officialId);
  return FetchUrlService.retrieveContent(mandatesUrl)
  .then(function(content) {
    return DeputyMandatesParser.parse(content)
    .then(function(mandates) {
      console.log("retrieved mandates for : " + deputy.lastname);
      deputy.currentMandateStartDate = mandates.currentMandateStartDate;
      deputy.mandates = mandates;
      return deputy;
    })
    .then(function(deputy) {
      return DeputyExtraPositionsParser.parse(content)
      .then(function(extraPositions) {
        console.log("retrieved extra positions for : " + deputy.lastname);
        deputy.extraPositions = extraPositions;
        return deputy;
      })
    })
    .then(function(deputy) {
      return DeputyInfosParser.parse(content)
      .then(function(deputyInfos) {
        console.log("retrieved deputyInfos for : " + deputy.lastname);
        deputy.phone = deputyInfos.phone;
        deputy.email = deputyInfos.email;
        deputy.job = deputyInfos.job;
        if (deputyInfos.declarationsUrl) {
          return retrieveDeclarationPdfUrl(deputyInfos.declarationsUrl)
          .then(function(declarations) {
            deputy.declarations = declarations;
            console.log("retrieved declarations for : " + deputy.lastname);
            return deputy;
          })
        } else {
          return deputy;
        }
      })
    })
  })
}

var retrieveDeclarationPdfUrl = function(allDeclaUrl) {
  var urlSplit = allDeclaUrl.split('/');
  var name = urlSplit.pop().split('.')[0];
  var url = DEPUTY_DECLARATIONS_URL.replace(PARAM_DEPUTE_NAME, name);
  return FetchUrlService.retrieveContent(url)
  .then(function(content) {
    return DeputyDeclarationsParser.parse(content)
  });
}
