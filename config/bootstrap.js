/**
* Bootstrap
* (sails.config.bootstrap)
*
* An asynchronous bootstrap function that runs before your Sails app gets lifted.
* This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
*
* For more information on bootstrapping your app, check out:
* http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
*/

var program = require('commander');
module.exports.bootstrap = function(cb) {

    sails.on('lifted', function() {
        console.log('Initializing DB')
        return DBBuilderService.initDB()
        .then(function() {
            program.option('-t, --typeOfScrap [typeOfScrap]', 'scrap deputies or ballots').parse(process.argv);
            if (program.typeOfScrap == 'deputies') {
                console.log('=> start scraping deputies');
                return AssembleeScrapingService.startScrapingDeputies()
            } else if (program.typeOfScrap == 'ballots') {
                console.log('=> start scraping ballots');
                return AssembleeScrapingService.startScrapingBallots()
            } else {
                console.log('/!\\ needs -t argument with "deputies" or "ballots" argument as scraping type');
            }
        })
        .then(function() {
            shutdownService();
        })
    })

    // It's very important to trigger this callback method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    cb();
};

let shutdownService = function() {
    console.log('Shutting down DB')
    DBBuilderService.shutdown();
    sails.lower(function (err) {
        if (err) {
            return console.log('Error occurred lowering Sails app: ', err);
        }
        console.log('Sails app lowered successfully!');
        console.log('Exit process')
        process.exit(0);
    })
}
