var Request = require('request-promise');

module.exports = {
    sendDeputiesUpdateNotif: function(deputiesIds) {
        console.log('=> RequestService.sendDeputiesUpdateNotif for ' + deputiesIds.length + 'deputies')
        var options = {
            method: 'POST',
            uri: 'http://localhost:1328/api/deputiesUpdated',
            body: {
                deputiesIds: deputiesIds
            },
            json: true
        };
        makeRequest(options);
    },

    sendBallotsUpdateNotif: function() {
        console.log('=> RequestService.sendBallotsUpdateNotif')
        var options = {
            method: 'POST',
            uri: 'http://localhost:1328/api/ballotsUpdated',
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
