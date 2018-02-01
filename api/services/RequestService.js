var Request = require('request-promise');

let apiHost = process.env.API_HOST || 'localhost'
let apiPort = process.env.API_PORT || '1328';
let apiVersion = process.env.API_VERSION || '1328';
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
        makeRequest(options);
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
        makeRequest(options);
    }
};

let makeRequest = function(options) {
    Request(options)
    .then(function (parsedBody) {
        // POST succeeded...
        parsedBody = null;
    })
    .catch(function(err) {
        console.log('makeRequest error ' + err)
        // POST failed...
    });
}
