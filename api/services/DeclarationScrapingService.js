'use strict';

let Promise = require('bluebird');
let Constants = require('./Constants.js')
let StringHelper = require('./helpers/StringHelper')
let DeclarationsUrlsParser = require('./parsers/DeclarationsUrlsParser')
let DeputyDeclarationsParser = require('./parsers/DeputyDeclarationsParser')

let allDeputiesUrls;

const PARAM_DEPUTY_NAME = '{deputy_name}';
const DEPUTY_DECLARATIONS_URL = 'http://www.hatvp.fr/fiche-nominative/?declarant=' + PARAM_DEPUTY_NAME;
const HATVP_DEPUTIES_LIST = 'http://www.hatvp.fr/resultat-de-recherche-avancee/?document=&mandat=depute&region=0&dep=';

module.exports = {
    retrieveAllDeputiesDeclarationsUrls: function() {
        return FetchUrlService.retrieveContent(HATVP_DEPUTIES_LIST)
        .then(function(content) {
            return DeclarationsUrlsParser.parse(content)
            .then(function(urls) {
                allDeputiesUrls = urls;
            })
        })
    },

    retrieveDeclarationPdfUrl: function(firstname, lastname) {
        let name = StringHelper.replaceAccents(lastname + '-' + firstname);
        let url = DEPUTY_DECLARATIONS_URL.replace(PARAM_DEPUTY_NAME, name).replace(/\s|'/g, '-').toLowerCase();
        for (let i in allDeputiesUrls) {
            if (allDeputiesUrls[i].startsWith(url)) {
                return parseDeclaration(allDeputiesUrls[i]);
            }
        }
    }
}

let parseDeclaration = function(url) {
    return FetchUrlService.retrieveContent(url)
    .then(function(content) {
        return DeputyDeclarationsParser.parse(content)
    });
}
