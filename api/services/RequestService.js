var Request = require('request-promise');

let apiHost = process.env.API_HOST || 'localhost'
let apiPort = process.env.API_PORT || '1328';
let apiVersion = process.env.API_VERSION || 'v1';
let apiBaseUrl = 'http://' + apiHost + ':' + apiPort + '/api/' + apiVersion + '/';

module.exports = {
    sendDeputiesUpdateNotif: function(deputiesIds) {
        console.log('=> RequestService.sendDeputiesUpdateNotif for ' + deputiesIds.length + ' deputies')
        var options = {
            method: 'POST',
            uri: apiBaseUrl + 'deputiesUpdated',
            body: {
                deputiesIds: deputiesIds
            },
            json: true
        };
        console.log('sendDeputiesUpdateNotif ' + options.uri)
        return makeRequest(options);
    },

    sendBallotsUpdateNotif: function() {
        console.log('=> RequestService.sendBallotsUpdateNotif')
        var options = {
            method: 'POST',
            uri: apiBaseUrl + 'ballotsUpdated',
            body: {
            },
            json: true
        };
        return makeRequest(options);
    },

    sendResetCache: function() {
        console.log('=> RequestService.sendResetCache')
        var options = {
            method: 'POST',
            uri: apiBaseUrl + 'resetCache',
            body: {
            },
            json: true
        };
        return makeRequest(options);
    },
};

let makeRequest = function(options) {
    return Request(options)
    .then(function (parsedBody) {
        // POST succeeded...
        parsedBody = null;
    })
    .catch(function(err) {
        console.log('makeRequest error ' + err)
        // POST failed...
    });
}
