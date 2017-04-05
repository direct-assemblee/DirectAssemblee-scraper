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
    program.option('-r, --resetDB', 'Reset database').parse(process.argv);
    if (program.resetDB) {
      console.log("Resetting DB")
      DBBuilderService.resetDB();
    } else {
      console.log("Initializing DB")
      DBBuilderService.initDB();
      AssembleeScrapingService.startScraping();
      NosDeputesScrapingService.startScraping();
    }
  });

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};
