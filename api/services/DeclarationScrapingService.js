'use strict';

let Constants = require('./Constants.js')
let StringHelper = require('./helpers/StringHelper')
let DeclarationsUrlsParser = require('./parsers/DeclarationsUrlsParser')
let DeputyDeclarationsParser = require('./parsers/DeputyDeclarationsParser')

const PARAM_DEPUTY_NAME = '{deputy_name}';
const DEPUTY_DECLARATIONS_URL = 'http://www.hatvp.fr/fiche-nominative/?declarant=' + PARAM_DEPUTY_NAME;
const HATVP_DEPUTIES_LIST = 'http://www.hatvp.fr/resultat-de-recherche-avancee/?document=&mandat=depute&region=0&dep=';

module.exports = {
    retrieveAllDeputiesDeclarationsUrls: function() {
        return FetchUrlService.retrieveContent(HATVP_DEPUTIES_LIST, DeclarationsUrlsParser);
    },

    retrieveDeclarationPdfUrl: function(allDeputiesUrls, firstname, lastname) {
        let name = StringHelper.replaceAccents(lastname + '-' + firstname);
        let url = DEPUTY_DECLARATIONS_URL.replace(PARAM_DEPUTY_NAME, name).replace(/\s|'/g, '-').toLowerCase();
        for (let i in allDeputiesUrls) {
            if (allDeputiesUrls[i].startsWith(url)) {
                return FetchUrlService.retrieveContent(allDeputiesUrls[i], DeputyDeclarationsParser);
            }
        }
        return new Promise(function(resolve) {
            resolve();
        })
    }
}
