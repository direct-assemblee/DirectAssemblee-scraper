'use strict';

let Promise = require('bluebird');
let Constants = require('./Constants.js')

let WorkHelper = require('./helpers/WorkHelper')
let DeputiesListParser = require('./parsers/DeputiesListParser');
let DeputyWorkParser = require('./parsers/DeputyWorkParser');
let DeputyQuestionThemeParser = require('./parsers/DeputyQuestionThemeParser');
let ThemeHelper = require('./helpers/ThemeHelper')
let DeputyWorkExtraInfosParser = require('./parsers/DeputyWorkExtraInfosParser');
let ExtraInfosLawProposalParser = require('./parsers/ExtraInfosLawProposalParser')
let ExtraInfosCommissionParser = require('./parsers/ExtraInfosCommissionParser')
let DeputyInfosParser = require('./parsers/DeputyInfosParser');
let DeputyDeclarationsParser = require('./parsers/DeputyDeclarationsParser');
let DeputyMandatesParser = require('./parsers/DeputyMandatesParser');
let DeputyExtraPositionsParser = require('./parsers/DeputyExtraPositionsParser');

const PARAM_WORK_TYPE = '{work_type}';
const PARAM_DEPUTY_NAME = '{deputy_name}';
const WORK_TYPES = [ Constants.WORK_TYPE_QUESTIONS, Constants.WORK_TYPE_REPORTS, Constants.WORK_TYPE_PROPOSITIONS, Constants.WORK_TYPE_COSIGNED_PROPOSITIONS, Constants.WORK_TYPE_COMMISSIONS, Constants.WORK_TYPE_PUBLIC_SESSIONS ]
const WORK_PAGE_SIZE = 10;
const DEPUTY_WORK_URL = Constants.BASE_URL + 'deputes/documents_parlementaires/(offset)/' + Constants.PARAM_OFFSET + '/(id_omc)/OMC_PA' + Constants.PARAM_DEPUTY_ID + '/(type)/' + PARAM_WORK_TYPE;
const DEPUTY_DECLARATIONS_URL = 'http://www.hatvp.fr/fiche-nominative/?declarant=' + PARAM_DEPUTY_NAME;

module.exports = {
    retrieveDeputiesList: function() {
        return FetchUrlService.retrieveContent(Constants.DEPUTIES_LIST_URL)
        .then(function(content) {
            return DeputiesListParser.parse(content)
        })
    },

    retrieveDeputies: function(deputies) {
        return Promise.map(deputies, function(deputy) {
            return retrieveDeputyDetails(deputy)
        })
    },

    checkMandate: function(deputy) {
        let deputyUrl = Constants.DEPUTY_INFO_URL.replace(Constants.PARAM_DEPUTY_ID, deputy.officialId);
        return FetchUrlService.retrieveContent(deputyUrl)
        .then(function(content) {
            return DeputyInfosParser.parse(content)
            .then(function(deputyInfos) {
                if (deputyInfos.endOfMandateDate) {
                    console.log('expired mandate for : ' + deputy.lastname + ' - end of mandate : ' + deputyInfos.endOfMandateDate);
                }
                deputy.endOfMandateDate = deputyInfos.endOfMandateDate;
                deputy.endOfMandateReason = deputyInfos.endOfMandateReason;
                return deputy;
            })
        })
    }
}

let retrieveDeputyDetails = function(deputy) {
    return retrieveDeputyWork(deputy)
    .then(function(works) {
        deputy.works = works;
        console.log('retrieved works for : ' + deputy.lastname);
        return retrieveDeputyInfosAndMandates(deputy)
        .then(function(deputy) {
            if (deputy) {
                console.log('retrieved all from deputy ' + deputy.lastname)
            }
            return deputy
        })
    })
}

let retrieveDeputyWork = function(deputy) {
    let allWorks = [];
    for (let i = 0 ; i < WORK_TYPES.length ; i++) {
        allWorks.push(retrieveDeputyWorkOfType(deputy, WORK_TYPES[i]))
    }
    return Promise.filter(allWorks, function(workOfType) {
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

let retrieveDeputyWorkOfType = function(deputy, workType) {
    return new Promise(function(resolve, reject) {
        let results = [];
        function next(page) {
            let url = getWorkPageUrl(deputy, workType, page)
            retrieveDeputyWorkOfTypeWithPage(url, workType)
            .then(function(works) {
                let shouldGetNext = false;
                if (works && works.length > 0) {
                    for (let i in works) {
                        results.push(works[i]);
                    }
                    shouldGetNext = works.length == WORK_PAGE_SIZE && page < 3;
                }
                if (shouldGetNext) {
                    next(page + 1);
                } else {
                    resolve(results);
                }
            }, reject);
        }
        next(0);
    });
}

let getWorkPageUrl = function(deputy, workType, pageOffset) {
    return DEPUTY_WORK_URL.replace(Constants.PARAM_DEPUTY_ID, deputy.officialId).replace(Constants.PARAM_OFFSET, pageOffset * WORK_PAGE_SIZE).replace(PARAM_WORK_TYPE, workType);
}

let retrieveDeputyWorkOfTypeWithPage = function(workUrl, workType) {
    return FetchUrlService.retrieveContent(workUrl)
    .then(function(content) {
        if (content) {
            return DeputyWorkParser.parse(content, workUrl)
            .then(function(works) {
                if (works) {
                    return Promise.filter(works, function(work) {
                        return work != undefined;
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
                        if (work.theme) {
                            return ThemeHelper.findTheme(work.theme)
                            .then(function(foundTheme) {
                                if (foundTheme) {
                                    work.theme = foundTheme;
                                } else {
                                    console.log('/!\\ new theme not recognized : ' + work.theme);
                                }
                                return work;
                            })
                        } else {
                            return work;
                        }
                    })
                } else {
                    console.log('/!\\ work : no works')
                    return;
                }
            })
        } else {
            console.log('/!\\ work : no content')
            return;
        }
    })
}

let retrieveExtraForWork = function(parsedWork) {
    if (parsedWork.type === Constants.WORK_TYPE_QUESTIONS || parsedWork.type === Constants.WORK_TYPE_PROPOSITIONS
        || parsedWork.type === Constants.WORK_TYPE_COSIGNED_PROPOSITIONS || parsedWork.type === Constants.WORK_TYPE_REPORTS
        || parsedWork.type === Constants.WORK_TYPE_COMMISSIONS) {
            return FetchUrlService.retrieveContentWithIsoEncoding(parsedWork.url, parsedWork.type != Constants.WORK_TYPE_QUESTIONS)
            .then(function(content) {
                if (content) {
                    if (parsedWork.type === Constants.WORK_TYPE_QUESTIONS) {
                        return DeputyQuestionThemeParser.parse(parsedWork.url, content, parsedWork.type)
                        .then(function(parsedTheme) {
                            parsedWork.theme = parsedTheme;
                            return parsedWork;
                        })
                    } else if (parsedWork.type === Constants.WORK_TYPE_PROPOSITIONS || parsedWork.type === Constants.WORK_TYPE_COSIGNED_PROPOSITIONS || parsedWork.type === Constants.WORK_TYPE_COMMISSIONS) {
                        let parser = parsedWork.type === Constants.WORK_TYPE_COMMISSIONS ? ExtraInfosCommissionParser : ExtraInfosLawProposalParser;
                        return parser.parse(parsedWork.url, content)
                        .then(function(work) {
                            parsedWork.id = work.id;
                            if (work.description) {
                                parsedWork.description = work.description;
                            }
                            parsedWork.theme = work.theme;
                            parsedWork.extraInfos = work.extraInfos;
                            return parsedWork;
                        })
                    } else {
                        return DeputyWorkExtraInfosParser.parse(parsedWork.url, content)
                        .then(function(work) {
                            parsedWork.id = work.id;
                            parsedWork.description = work.description;
                            parsedWork.theme = work.theme;
                            return parsedWork;
                        })
                    }
                } else {
                    console.log('/!\\ no extra for work')
                    return parsedWork;
                }
            })
        } else {
            return parsedWork;
        }
    }

    let retrieveDeputyInfosAndMandates = function(deputy) {
        let mandatesUrl = Constants.DEPUTY_INFO_URL.replace(Constants.PARAM_DEPUTY_ID, deputy.officialId);
        return FetchUrlService.retrieveContent(mandatesUrl)
        .then(function(content) {
            if (content) {
                return DeputyMandatesParser.parse(content)
                .then(function(mandates) {
                    console.log('retrieved mandates for : ' + deputy.lastname);
                    deputy.currentMandateStartDate = mandates.currentMandateStartDate;
                    deputy.mandates = mandates;
                    return deputy;
                })
                .then(function(deputy) {
                    return DeputyExtraPositionsParser.parse(content)
                    .then(function(extraPositions) {
                        console.log('retrieved extra positions for : ' + deputy.lastname);
                        deputy.extraPositions = extraPositions;
                        return deputy;
                    })
                })
                .then(function(deputy) {
                    return DeputyInfosParser.parse(content)
                    .then(function(deputyInfos) {
                        console.log('retrieved deputyInfos for : ' + deputy.lastname);
                        deputy.phone = deputyInfos.phone;
                        deputy.email = deputyInfos.email;
                        deputy.job = deputyInfos.job;
                        deputy.birthDate = deputyInfos.birthDate;
                        deputy.parliamentGroup = deputyInfos.parliamentGroup;
                        deputy.seatNumber = deputyInfos.seatNumber;
                        if (deputyInfos.declarationsUrl) {
                            return retrieveDeclarationPdfUrl(deputyInfos.declarationsUrl)
                            .then(function(declarations) {
                                deputy.declarations = declarations;
                                console.log('retrieved declarations for : ' + deputy.lastname);
                                return deputy;
                            })
                        } else {
                            return deputy;
                        }
                    })
                })
            } else {
                console.log('/!\\ no mandates')
                return
            }
        })
    }

    let retrieveDeclarationPdfUrl = function(allDeclaUrl) {
        let urlSplit = allDeclaUrl.split('/');
        let name = urlSplit.pop().split('.')[0];
        let url = DEPUTY_DECLARATIONS_URL.replace(PARAM_DEPUTY_NAME, name);
        return FetchUrlService.retrieveContent(url)
        .then(function(content) {
            return DeputyDeclarationsParser.parse(content)
        });
    }
