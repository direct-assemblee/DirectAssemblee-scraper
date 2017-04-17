var Promise = require("bluebird");
var Constants = require('./Constants.js')

var DeputiesListParser = require('./parsers/DeputiesListParser');
var DeputyWorkParser = require('./parsers/DeputyWorkParser');
var DeputyInfosParser = require('./parsers/DeputyInfosParser');
var DeputyDeclarationsParser = require('./parsers/DeputyDeclarationsParser');
var DeputyMandatesParser = require('./parsers/DeputyMandatesParser');

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

var retrieveAllDeputies = function() {
  return FetchUrlService.retrieveContent(Constants.DEPUTIES_LIST_URL)
  .then(function(content) {
    return DeputiesListParser.parse(content)
  })
  .then(function(deputies) {
    var promises = [];
    for (var i = 0 ; i < deputies.length ; i++) {
      promises.push(retrieveDeputyDetails(deputies[i]));
    }
    return Promise.all(promises);
  })
}

var retrieveDeputyDetails = function(deputy) {
  return retrieveDeputyWork(deputy)
  .then(function(deputyWork) {
    deputy.work = []
    for (i in deputyWork) {
      deputy.work = deputy.work.concat(deputyWork[i])
    }
    return deputy;
  })
  .then(function(deputy) {
    return retrieveDeputyInfosAndMandates(deputy)
  })
  .then(function(deputy) {
    console.log(deputy)
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
    for (var i in works) {
      previousWork.push(works[i]);
    }
    var lastWork = previousWork[previousWork.length - 1];
    if (lastWork && works && works.length >= WORK_PAGE_SIZE) {
      var newOffset = pageOffset + 1;
      return retrieveDeputyWorkOfType(deputy, workType, newOffset, previousWork);
    } else {
      return Promise.resolve(previousWork);
    }
  })
}

var retrieveDeputyInfosAndMandates = function(deputy) {
  var mandatesUrl = Constants.DEPUTY_INFO_URL.replace(Constants.PARAM_DEPUTY_ID, deputy.officialId);
  return FetchUrlService.retrieveContent(mandatesUrl)
  .then(function(content) {
    return DeputyMandatesParser.parse(content)
    .then(function(mandates) {
      deputy.mandates = mandates;
      return deputy;
    })
    .then(function(deputy) {
      return DeputyInfosParser.parse(content)
      .then(function(deputyInfos) {
        deputy.phone = deputyInfos.phone;
        deputy.email = deputyInfos.email;
        return retrieveDeclarationPdfUrl(deputyInfos.declarationsUrl)
        .then(function(declarations) {
          deputy.declarations = declarations;
          return deputy;
        })
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

module.exports = {
  retrieveDeputies: function() {
    return retrieveAllDeputies()
  }
}
