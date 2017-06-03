var Promise = require("bluebird");
var Constants = require('./Constants.js')

var DeputiesListParser = require('./parsers/DeputiesListParser');
var DeputyWorkParser = require('./parsers/DeputyWorkParser');
var DeputyQuestionThemeParser = require('./parsers/DeputyQuestionThemeParser');
var DeputyWorkExtraInfosParser = require('./parsers/DeputyWorkExtraInfosParser');
var DeputyInfosParser = require('./parsers/DeputyInfosParser');
var DeputyDeclarationsParser = require('./parsers/DeputyDeclarationsParser');
var DeputyMandatesParser = require('./parsers/DeputyMandatesParser');
var DeputyExtraPositionsParser = require('./parsers/DeputyExtraPositionsParser');

const PARAM_WORK_TYPE = "{work_type}";
const PARAM_DEPUTY_NAME = "{deputy_name}";
const WORK_TYPES = [ Constants.WORK_TYPE_QUESTIONS, Constants.WORK_TYPE_REPORTS, Constants.WORK_TYPE_PROPOSITIONS, Constants.WORK_TYPE_COSIGNED_PROPOSITIONS, Constants.WORK_TYPE_COMMISSIONS, Constants.WORK_TYPE_PUBLIC_SESSION ]
const WORK_PAGE_SIZE = 10;
const DEPUTY_WORK_URL = Constants.BASE_URL + "deputes/documents_parlementaires/(offset)/" + Constants.PARAM_OFFSET + "/(id_omc)/OMC_PA" + Constants.PARAM_DEPUTY_ID + "/(type)/" + PARAM_WORK_TYPE;
const DEPUTY_DECLARATIONS_URL = "http://www.hatvp.fr/fiche-nominative/?declarant=" + PARAM_DEPUTY_NAME;

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
  },

  checkMandate: function(deputy) {
    var deputyUrl = Constants.DEPUTY_INFO_URL.replace(Constants.PARAM_DEPUTY_ID, deputy.officialId);
    return FetchUrlService.retrieveContent(deputyUrl)
    .then(function(content) {
      return DeputyInfosParser.parse(content)
      .then(function(deputyInfos) {
        console.log("checking mandate for : " + deputy.lastname + " - end of mandate : " + deputyInfos.endOfMandateDate);
        deputy.endOfMandateDate = deputyInfos.endOfMandateDate;
        deputy.endOfMandateReason = deputyInfos.endOfMandateReason;
        return deputy;
      })
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
    var worksWithExtra = [];
    for (var i in works) {
      works[i].type = workType;
      worksWithExtra.push(retrieveExtraForWork(works[i]));
    }
    return Promise.all(worksWithExtra)
  })
  .then(function(works) {
    for (var i in works) {
      if (workType == Constants.WORK_TYPE_COMMISSIONS) {
        works[i].title = works[i].title.split('-')[1].trim();
      }
      works[i].type = getTypeName(workType);
      previousWork.push(works[i]);
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

var retrieveExtraForWork = function(parsedWork) {
  if (parsedWork.type === Constants.WORK_TYPE_QUESTIONS || parsedWork.type === Constants.WORK_TYPE_PROPOSITIONS
    || parsedWork.type === Constants.WORK_TYPE_COSIGNED_PROPOSITIONS || parsedWork.type === Constants.WORK_TYPE_REPORTS) {
    return FetchUrlService.retrieveContent(parsedWork.url, parsedWork.type != Constants.WORK_TYPE_QUESTIONS)
    .then(function(content) {
      if (parsedWork.type === Constants.WORK_TYPE_QUESTIONS) {
        return DeputyQuestionThemeParser.parse(parsedWork.url, content, parsedWork.type)
        .then(function(theme) {
          parsedWork.theme = theme;
          return parsedWork;
        })
      } else {
        return DeputyWorkExtraInfosParser.parse(parsedWork.url, content, parsedWork.type)
        .then(function(lawProposal) {
          parsedWork.id = lawProposal.id;
          parsedWork.title = lawProposal.title;
          parsedWork.description = lawProposal.description;
          parsedWork.theme = lawProposal.theme;
          return parsedWork;
        })
      }
    })
  } else {
    return new Promise(function(resolve, reject) {
      resolve(parsedWork);
    })
  }
}

var getTypeName = function(workType) {
  var typeName;
  switch (workType) {
    case Constants.WORK_TYPE_QUESTIONS:
      typeName = "question";
      break;
    case Constants.WORK_TYPE_REPORTS:
      typeName = "report";
      break;
    case Constants.WORK_TYPE_PROPOSITIONS:
      typeName = "law_proposal";
      break;
    case Constants.WORK_TYPE_COSIGNED_PROPOSITIONS:
      typeName = "cosigned_law_proposal";
      break;
    case Constants.WORK_TYPE_COMMISSIONS:
      typeName = "commission";
      break;
    case Constants.WORK_TYPE_PUBLIC_SESSION:
      typeName = "public_session";
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
        deputy.seatNumber = deputyInfos.seatNumber;
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
  var url = DEPUTY_DECLARATIONS_URL.replace(PARAM_DEPUTY_NAME, name);
  return FetchUrlService.retrieveContent(url)
  .then(function(content) {
    return DeputyDeclarationsParser.parse(content)
  });
}
