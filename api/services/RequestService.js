var Request = require('request-promise');

module.exports = {
    sendDeputyUpdateNotif: function(deputyId) {
        console.log('RequestService.sendDeputyUpdateNotif')
        var options = {
            method: 'POST',
            uri: 'http://localhost:1328/api/deputyUpdated',
            body: {
                deputyId: deputyId
            },
            json: true
        };
        makeRequest(options);
    },

    sendBallotsUpdateNotif: function() {
        console.log('RequestService.sendBallotsUpdateNotif')
        var options = {
            method: 'POST',
            uri: 'http://localhost:1328/api/ballotsUpdated',
            body: {
            },
            json: true
        };
        makeRequest(options);
    },

    sendDoneUpdatingNotif: function() {
        console.log('RequestService.sendDoneUpdatingNotif')
        var options = {
            method: 'POST',
            uri: 'http://localhost:1328/api/updatesDone',
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
        console.log('makeRequest success')
        // POST succeeded...
        parsedBody = null;
    })
    .catch(function(err) {
        console.log('makeRequest error ' + err)
        // POST failed...
    });
}
