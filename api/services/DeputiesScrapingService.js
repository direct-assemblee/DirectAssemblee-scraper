'use strict';

let Promise = require('bluebird');
let Constants = require('./Constants.js')

let WorkHelper = require('./helpers/WorkHelper')
let DateHelper = require('./helpers/DateHelper')
let WorkService = require('./database/WorkService')
let DeputiesListParser = require('./parsers/DeputiesListParser');
let DeclarationScrapingService = require('./DeclarationScrapingService');
let DeputyWorkParser = require('./parsers/DeputyWorkParser');
let DeputyQuestionThemeParser = require('./parsers/DeputyQuestionThemeParser');
let ThemeHelper = require('./helpers/ThemeHelper')
let DeputyWorkExtraInfosParser = require('./parsers/DeputyWorkExtraInfosParser');
let ExtraInfosLawProposalParser = require('./parsers/ExtraInfosLawProposalParser')
let ExtraInfosCommissionParser = require('./parsers/ExtraInfosCommissionParser')
let DeputyInfosParser = require('./parsers/DeputyInfosParser');
let DeputyInfosAndMandatesParser = require('./parsers/DeputyInfosAndMandatesParser');

const PARAM_WORK_TYPE = '{work_type}';
const PARAM_DEPUTY_NAME = '{deputy_name}';
const WORK_TYPES = [ Constants.WORK_TYPE_QUESTIONS, Constants.WORK_TYPE_REPORTS, Constants.WORK_TYPE_PROPOSITIONS, Constants.WORK_TYPE_COSIGNED_PROPOSITIONS, Constants.WORK_TYPE_COMMISSIONS, Constants.WORK_TYPE_PUBLIC_SESSIONS ]
const WORK_PAGE_SIZE = 10;
const DEPUTY_WORK_URL = Constants.BASE_URL + 'deputes/documents_parlementaires/(offset)/' + Constants.PARAM_OFFSET + '/(id_omc)/OMC_PA' + Constants.PARAM_DEPUTY_ID + '/(type)/' + PARAM_WORK_TYPE;
const DEPUTY_DECLARATIONS_URL = 'http://www.hatvp.fr/fiche-nominative/?declarant=' + PARAM_DEPUTY_NAME;
const HATVP_DEPUTIES_LIST = 'http://www.hatvp.fr/resultat-de-recherche-avancee/?document=&mandat=depute&region=0&dep=';
const HATVP_DEPUTY_URL_START = 'http://www.hatvp.fr/fiche-nominative/?declarant=';

module.exports = {
    retrieveDeputiesList: function() {
        return FetchUrlService.retrieveContent(Constants.DEPUTIES_LIST_URL, DeputiesListParser);
    },

    retrieveDeputies: function(allDeputiesUrls, deputies) {
        return Promise.map(deputies, function(deputy) {
            return retrieveDeputyDetails(allDeputiesUrls, deputy)
        })
    },

    checkMandate: function(deputy) {
        let deputyUrl = Constants.DEPUTY_INFO_URL.replace(Constants.PARAM_DEPUTY_ID, deputy.officialId);
        return FetchUrlService.retrieveContent(deputyUrl, DeputyInfosParser)
        .then(function(deputyInfos) {
            if (deputyInfos) {
                if (deputyInfos.endOfMandateDate) {
                    console.log('/!\\ expired mandate for : ' + deputy.lastname + ' - end of mandate : ' + deputyInfos.endOfMandateDate);
                }
                deputy.endOfMandateDate = deputyInfos.endOfMandateDate;
                deputy.endOfMandateReason = deputyInfos.endOfMandateReason;
            }
            return deputy;
        });
    }
}

let retrieveDeputyDetails = function(allDeputiesUrls, deputy) {
    return DeclarationScrapingService.retrieveDeclarationPdfUrl(allDeputiesUrls, deputy.firstname, deputy.lastname)
    .then(function(declarations) {
        console.log('-- retrieved declarations for : ' + deputy.lastname);
        deputy.declarations = declarations;
        return deputy;
    })
    .then(async function(deputy) {
        let allWorks = await WorkService.findWorksWithAuthorsAndSubscribers();
        return retrieveDeputyWork(allWorks, deputy)
        .then(function(works) {
            deputy.works = works;
            console.log('-- retrieved works for : ' + deputy.lastname);
            return retrieveDeputyInfosAndMandates(deputy)
        })
        .then(function(fullDeputy) {
            console.log('-- retrieved infos and mandates from deputy ' + deputy.lastname);
            return fullDeputy;
        });
    })
}

let retrieveDeputyWork = async function(allWorks, deputy) {
    let lastWorkDate = await WorkService.findLastWorkDate(allWorks, deputy.officialId);

    let deputyWorks = [];
    for (let i = 0 ; i < WORK_TYPES.length ; i++) {
        deputyWorks.push(retrieveDeputyWorkOfType(deputy, WORK_TYPES[i], lastWorkDate))
    }
    return Promise.filter(deputyWorks, function(workOfType) {
        return workOfType.length > 0;
    })
    .then(function(works) {
        let concatWorks = [];
        for (let i in works) {
            for (let j in works[i]) {
                concatWorks.push(works[i][j]);
            }
        }
        return concatWorks;
    });
}

let retrieveDeputyWorkOfType = async function(deputy, workType, lastWorkDate) {
    let results = [];
    let page = 0;

    let shouldGetNext = true;
    while (shouldGetNext) {
        let url = getWorkPageUrl(deputy, workType, page);
        let works = await retrieveDeputyWorkOfTypeWithPage(url, workType, lastWorkDate);
        shouldGetNext = false;
        if (works && works.length > 0) {
            for (let i in works) {
                results.push(works[i]);
            }
            shouldGetNext = works.length == WORK_PAGE_SIZE;
        }
        page++;
    }
    return results;
}

let getWorkPageUrl = function(deputy, workType, pageOffset) {
    return DEPUTY_WORK_URL.replace(Constants.PARAM_DEPUTY_ID, deputy.officialId).replace(Constants.PARAM_OFFSET, pageOffset * WORK_PAGE_SIZE).replace(PARAM_WORK_TYPE, workType);
}

let retrieveDeputyWorkOfTypeWithPage = function(workUrl, workType, lastWorkDate) {
    return FetchUrlService.retrieveContent(workUrl, DeputyWorkParser)
    .then(function(works) {
        if (works) {
            return Promise.filter(works, function(work) {
                return work != undefined && (!lastWorkDate || DateHelper.isLaterOrSame(work.date, lastWorkDate));
            })
            .map(function(work) {
                work.type = workType;
                return retrieveExtraForWork(work);
            })
            .map(function(work) {
                if (workType == Constants.WORK_TYPE_COMMISSIONS) {
                    let title = work.title.split('-')[1];
                    if (title) {
                        work.title = title.trim();
                    }
                }
                work.type = WorkHelper.getWorkTypeName(workType);
                return setThemeToWork(work, workType);
            })
        } else {
            console.log('/!\\ work : no works')
            return null;
        }
    });
}

let setThemeToWork = function(work, parsedWorkType) {
    let themeToSearch;
    if (work.parsedTheme) {
        themeToSearch = work.parsedTheme
    } else if (parsedWorkType === Constants.WORK_TYPE_COMMISSIONS || parsedWorkType === Constants.WORK_TYPE_PUBLIC_SESSIONS) {
        themeToSearch = 'Politique générale';
    }

    if (themeToSearch) {
        return searchTheme(work, themeToSearch)
        .then(function(theme) {
            work.theme = theme.foundTheme;
            work.originalThemeName = theme.originalThemeName;
            return work;
        })
    } else {
        return new Promise(function(resolve) {
            resolve(work);
        })
    }
}

let searchTheme = function(work, themeName) {
    return ThemeHelper.findTheme(themeName)
    .then(function(foundTheme) {
        if (!foundTheme) {
            console.log('/!\\ new theme not recognized : ' + themeName);
        }
        return { foundTheme: foundTheme, originalThemeName : themeName };
    })
}

let retrieveExtraForWork = function(parsedWork) {
    if (isNotPublicSession(parsedWork.type)) {
        return FetchUrlService.retrieveContentWithIsoEncoding(parsedWork.url, parsedWork.type != Constants.WORK_TYPE_QUESTIONS, getParserForType(parsedWork))
        .then(function(result) {
            if (result) {
                return processResultForType(parsedWork, result);
            } else {
                console.log('/!\\ no extra for work')
                return parsedWork;
            }
        });
    } else {
        return parsedWork;
    }
}

let isNotPublicSession = function(workType) {
    return workType === Constants.WORK_TYPE_QUESTIONS || workType === Constants.WORK_TYPE_PROPOSITIONS
        || workType === Constants.WORK_TYPE_COSIGNED_PROPOSITIONS || workType === Constants.WORK_TYPE_REPORTS
        || workType === Constants.WORK_TYPE_COMMISSIONS;
}

let getParserForType = function(parsedWork) {
    let parser;
    if (parsedWork.type === Constants.WORK_TYPE_QUESTIONS) {
        parser = DeputyQuestionThemeParser;
    } else if (parsedWork.type === Constants.WORK_TYPE_PROPOSITIONS || parsedWork.type === Constants.WORK_TYPE_COSIGNED_PROPOSITIONS || parsedWork.type === Constants.WORK_TYPE_COMMISSIONS) {
        if (parsedWork.type === Constants.WORK_TYPE_COMMISSIONS) {
            parser = ExtraInfosCommissionParser;
        } else {
            parser = ExtraInfosLawProposalParser;
        }
    } else {
        parser = DeputyWorkExtraInfosParser;
    }
    return parser;
}

let processResultForQuestion = function(parsedWork, result) {
    parsedWork.parsedTheme = result;
    return parsedWork;
}

let processResultForExtraInfos = function(parsedWork, result) {
    parsedWork.id = result.id;
    if (result.description) {
        parsedWork.description = result.description;
    }
    parsedWork.parsedTheme = result.theme;
    parsedWork.extraInfos = result.extraInfos;
    return parsedWork;
}

let processResultForOtherTypes = function(parsedWork, result) {
    parsedWork.id = result.id;
    parsedWork.description = result.description;
    parsedWork.parsedTheme = result.theme;
    return parsedWork;
}

let processResultForType = function(parsedWork, result) {
    let processedResult;
    if (parsedWork.type === Constants.WORK_TYPE_QUESTIONS) {
        processedResult = processResultForQuestion(parsedWork, result);
    } else if (parsedWork.type === Constants.WORK_TYPE_PROPOSITIONS || parsedWork.type === Constants.WORK_TYPE_COSIGNED_PROPOSITIONS || parsedWork.type === Constants.WORK_TYPE_COMMISSIONS) {
        processedResult = processResultForExtraInfos(parsedWork, result);
    } else {
        processedResult = processResultForOtherTypes(parsedWork, result);
    }
    return processedResult;
}

let retrieveDeputyInstances = function(deputy) {
    let deputyInfosUrl = Constants.DEPUTY_INFO_URL.replace(Constants.PARAM_DEPUTY_ID, deputy.officialId);
    return FetchUrlService.retrieveContent(deputyInfosUrl, DeputyInstancesParser)
    .then(function(instancesWithRoles) {
        deputy.instancesWithRoles = instancesWithRoles
        return deputy
    })
}

let retrieveDeputyInfosAndMandates = function(deputy) {
    let mandatesUrl = Constants.DEPUTY_INFO_URL.replace(Constants.PARAM_DEPUTY_ID, deputy.officialId);
    return FetchUrlService.retrieveContent(mandatesUrl, DeputyInfosAndMandatesParser)
    .then(function(result) {
        if (result) {
            deputy.instancesWithRoles = result.instances;

            deputy.currentMandateStartDate = result.mandates.currentMandateStartDate;
            deputy.mandates = result.mandates;

            deputy.phone = result.infos.phone;
            deputy.email = result.infos.email;
            deputy.job = result.infos.job;
            deputy.birthDate = result.infos.birthDate;
            deputy.parliamentGroup = result.infos.parliamentGroup;
            deputy.seatNumber = result.infos.seatNumber;
            return deputy;
        } else {
            console.log('/!\\ no mandates')
            return;
        }
    })
}
