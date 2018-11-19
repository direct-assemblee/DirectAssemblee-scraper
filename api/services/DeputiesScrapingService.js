'use strict';

let Promise = require('bluebird');
let Constants = require('./Constants.js')

let WorkAndBallotTypeHelper = require('./helpers/WorkAndBallotTypeHelper')
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
const WORK_OFFICIAL_TYPES = [ WorkAndBallotTypeHelper.WORK_OFFICIAL_PATH_QUESTIONS, WorkAndBallotTypeHelper.WORK_OFFICIAL_PATH_REPORTS, WorkAndBallotTypeHelper.WORK_OFFICIAL_PATH_PROPOSITIONS, WorkAndBallotTypeHelper.WORK_OFFICIAL_PATH_COSIGNED_PROPOSITIONS, WorkAndBallotTypeHelper.WORK_OFFICIAL_PATH_COMMISSIONS, WorkAndBallotTypeHelper.WORK_OFFICIAL_PATH_PUBLIC_SESSIONS ]
const WORK_PAGE_SIZE = 10;

const DEPUTIES_LIST_URL = Constants.BASE_URL + 'deputes/liste/departements/(vue)/tableau';
const DEPUTY_INFO_URL = Constants.BASE_URL + 'deputes/fiche/OMC_PA' + Constants.PARAM_DEPUTY_ID;
const DEPUTY_WORK_URL = Constants.BASE_URL + 'deputes/documents_parlementaires/(offset)/' + Constants.PARAM_OFFSET + '/(id_omc)/OMC_PA' + Constants.PARAM_DEPUTY_ID + '/(type)/' + PARAM_WORK_TYPE;
const DEPUTY_DECLARATIONS_URL = 'http://www.hatvp.fr/fiche-nominative/?declarant=' + PARAM_DEPUTY_NAME;
const HATVP_DEPUTIES_LIST = 'http://www.hatvp.fr/resultat-de-recherche-avancee/?document=&mandat=depute&region=0&dep=';
const HATVP_DEPUTY_URL_START = 'http://www.hatvp.fr/fiche-nominative/?declarant=';

module.exports = {
    retrieveDeputiesList: function() {
        return FetchUrlService.retrieveContent(DEPUTIES_LIST_URL, DeputiesListParser);
    },

    retrieveDeputies: function(allDeputiesUrls, deputies) {
        return Promise.map(deputies, function(deputy) {
            return retrieveDeputyDetails(allDeputiesUrls, deputy)
        })
    },

    checkMandate: function(deputy) {
        let deputyUrl = DEPUTY_INFO_URL.replace(Constants.PARAM_DEPUTY_ID, deputy.officialId);
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
        console.log('-- affected declarations for : ' + deputy.lastname);
        return deputy;
    })
    .then(async function(deputy) {
        console.log('-- start findWorksWithAuthorsAndSubscribers for : ' + deputy.lastname);
        let allWorks = await WorkService.findWorksWithAuthorsAndSubscribers();
        console.log('-- end findWorksWithAuthorsAndSubscribers for : ' + deputy.lastname);
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

    console.log('-- start retrieveDeputyWork for : ' + deputy.lastname);
    let lastWorkDate = await WorkService.findLastWorkDate(allWorks, deputy.officialId);

    let deputyWorks = [];
    for (let i = 0 ; i < WORK_OFFICIAL_TYPES.length ; i++) {
        deputyWorks.push(retrieveDeputyWorkOfType(deputy, WORK_OFFICIAL_TYPES[i], lastWorkDate))
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
        console.log('-- end retrieveDeputyWork for : ' + deputy.lastname);
        return concatWorks;
    });
}

let retrieveDeputyWorkOfType = async function(deputy, parsedWorkType, lastWorkDate) {
    let results = [];
    let page = 0;

    console.log('-- start retrieveDeputyWorkOfType for : ' + deputy.lastname);

    let shouldGetNext = true;
    while (shouldGetNext) {
        let url = getWorkPageUrl(deputy, parsedWorkType, page);
        let works = await retrieveDeputyWorkOfTypeWithPage(url, parsedWorkType, lastWorkDate);
        shouldGetNext = false;
        if (works && works.length > 0) {
            for (let i in works) {
                results.push(works[i]);
            }
            shouldGetNext = works.length == WORK_PAGE_SIZE;
        }
        page++;
    }
    console.log('-- end retrieveDeputyWorkOfType for : ' + deputy.lastname);
    return results;
}

let getWorkPageUrl = function(deputy, parsedWorkType, pageOffset) {
    return DEPUTY_WORK_URL.replace(Constants.PARAM_DEPUTY_ID, deputy.officialId).replace(Constants.PARAM_OFFSET, pageOffset * WORK_PAGE_SIZE).replace(PARAM_WORK_TYPE, parsedWorkType);
}

let retrieveDeputyWorkOfTypeWithPage = function(workUrl, parsedWorkType, lastWorkDate) {
    console.log('-- start retrieveDeputyWorkOfTypeWithPage for : ' + workUrl);
    return FetchUrlService.retrieveContent(workUrl, DeputyWorkParser)
    .then(function(works) {
        if (works) {
            return Promise.filter(works, function(work) {
                return work != undefined && (!lastWorkDate || DateHelper.isLaterOrSame(work.date, lastWorkDate));
            })
            .map(function(work) {
                return retrieveExtraForWork(work, parsedWorkType);
            })
            .map(function(work) {
                return WorkAndBallotTypeHelper.getWorkTypeId(parsedWorkType)
                .then(function(workTypeId) {
                    work.type = workTypeId
                    console.log('-- end retrieveDeputyWorkOfTypeWithPage for : ' + workUrl);
                    return setThemeToWork(work, parsedWorkType);
                })
            })
        } else {
            console.log('/!\\ work : no works')
            return null;
        }
    });
}

let retrieveExtraForWork = function(parsedWork, parsedWorkType) {
    if (!WorkAndBallotTypeHelper.isPublicSession(parsedWorkType)) {
        return FetchUrlService.retrieveContentWithIsoEncoding(parsedWork.url, !WorkAndBallotTypeHelper.isQuestion(parsedWorkType), getParserForType(parsedWorkType))
        .then(function(result) {
            if (result) {
                return processResultForType(parsedWork, parsedWorkType, result);
            } else {
                console.log('/!\\ no extra for work')
                return parsedWork;
            }
        });
    } else {
        return parsedWork;
    }
}

let getParserForType = function(parsedWorkType) {
    let parser;
    if (WorkAndBallotTypeHelper.isQuestion(parsedWorkType)) {
        parser = DeputyQuestionThemeParser;
    } else if (WorkAndBallotTypeHelper.isProposition(parsedWorkType)) {
        parser = ExtraInfosLawProposalParser;
    } else if (WorkAndBallotTypeHelper.isCommission(parsedWorkType)) {
        parser = ExtraInfosCommissionParser;
    } else {
        parser = DeputyWorkExtraInfosParser;
    }
    return parser;
}

let processResultForType = function(parsedWork, parsedWorkType, result) {
    let resultingWork;
    if (WorkAndBallotTypeHelper.isQuestion(parsedWorkType)) {
        resultingWork = processResultForQuestion(parsedWork, result);
    } else if (WorkAndBallotTypeHelper.isProposition(parsedWorkType) || WorkAndBallotTypeHelper.isCommission(parsedWorkType)) {
        resultingWork = processResultForExtraInfos(parsedWork, parsedWorkType, result);
    } else {
        resultingWork = processResultForOtherTypes(parsedWork, result);
    }
    resultingWork.isCreation = WorkAndBallotTypeHelper.isCreation(parsedWorkType)
    return resultingWork;
}

let processResultForQuestion = function(parsedWork, result) {
    parsedWork.parsedTheme = result;
    return parsedWork;
}

let processResultForExtraInfos = function(parsedWork, parsedWorkType, result) {
    parsedWork.id = result.id;
    if (result.description) {
        parsedWork.description = result.description;
    }
    parsedWork.parsedTheme = result.theme;
    parsedWork.extraInfos = result.extraInfos;

    parsedWork.title = adjustTitleIfCommission(parsedWork.title, parsedWorkType)
    return parsedWork;
}

let processResultForOtherTypes = function(parsedWork, result) {
    parsedWork.id = result.id;
    parsedWork.description = result.description;
    parsedWork.parsedTheme = result.theme;
    return parsedWork;
}

let adjustTitleIfCommission = function(workTitle, parsedWorkType) {
    let title = workTitle
    if (parsedWorkType == WorkAndBallotTypeHelper.WORK_OFFICIAL_PATH_COMMISSIONS) {
        let split = title.split('-')[1];
        if (split) {
            title = split.trim();
        }
    }
    return title
}


let setThemeToWork = function(work, parsedWorkType) {
    let themeToSearch;
    if (work.parsedTheme) {
        themeToSearch = work.parsedTheme
    } else if (parsedWorkType === WorkAndBallotTypeHelper.WORK_OFFICIAL_PATH_COMMISSIONS || parsedWorkType === WorkAndBallotTypeHelper.WORK_OFFICIAL_PATH_PUBLIC_SESSIONS) {
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

let retrieveDeputyInfosAndMandates = function(deputy) {
    let mandatesUrl = DEPUTY_INFO_URL.replace(Constants.PARAM_DEPUTY_ID, deputy.officialId);
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
