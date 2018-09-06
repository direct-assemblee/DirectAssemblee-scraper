var sails = require('sails');
var _ = require('lodash');

global.chai = require('chai');
global.should = chai.should();

before(function (done) {

    // Increase the Mocha timeout so that Sails has enough time to lift.
    this.timeout(5000);

    sails.lift({
        log: {
            level: 'silent'
        },
        hooks: {
            grunt: false
        },
        models: {
            connection: 'unitTestConnection',
            migrate: 'drop'
        },
        connections: {
            unitTestConnection: {
                adapter: 'sails-disk'
            }
        }
    }, function (err, server) {
        if (err) {
            return done(err);
        }
        // here you can load fixtures, etc.
        done(err, sails);
    });
});

after(function (done) {
    // here you can clear fixtures, etc.
    if (sails && _.isFunction(sails.lower)) {
        sails.lower(done);
    }
});
