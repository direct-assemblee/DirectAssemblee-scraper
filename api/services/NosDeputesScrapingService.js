var cron = require('node-cron');
var Promise = require("bluebird");
var moment = require('moment');

var FetchUrlService = require('./FetchUrlService.js');
var DeputesInfosService = require('./database/DeputesInfosService.js');
var DeputesInfosParser = require('./parsers/DeputesInfosParser.js')
var Constants = require('./Constants.js')

const EVERY_DAY = '0 0 * * *';

var retrieveDeputesDetailsCallback = function() {
    console.log(resultItems)
}

var self = module.exports = {
    startService: function() {
        cron.schedule(EVERY_DAY, function() {
            self.startScraping()
        });
    },

    startScraping: function() {
        self.retrieveDeputesUrls();
    },

    retrieveDeputesUrls: function() {
        FetchUrlService.retrieveContent(Constants.ALL_DEPUTES_URL)
        .then(function(content) {
            DeputesInfosParser.parseList(content)
            .then(function(deputesUrls) {
                for (i in deputesUrls) {
                    var url = deputesUrls[i]
                    self.retrieveDeputeInfos(url);
                }
            });
        });
    },

    retrieveDeputeInfos: function(url) {
        FetchUrlService.retrieveContent(url)
        .then(function(content) {
            DeputesInfosParser.parse(content)
            .then(function(resultItems) {
                DeputesInfosService.insertAllDeputesInfos(resultItems)
                .then(function(insertedDeputesInfos) {
                    console.log("inserted or updated deputes infos")
                });
            });
        });
    }
}
