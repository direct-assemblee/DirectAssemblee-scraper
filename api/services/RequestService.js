var Request = require('request-promise');

module.exports = {
    sendDeputyUpdateNotif: function(deputyId) {
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
        // POST succeeded...
        parsedBody = null;
    })
    .catch(function(err) {
        // POST failed...
    });
}
