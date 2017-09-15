require('../../../bootstrap');
let BallotThemeHelper = require('../../../../api/services/helpers/BallotThemeHelper.js')

describe('The BallotThemeHelper', function () {
    it('should return correct theme', function(done) {
        BallotThemeHelper.findTheme('Politique extérieure')
        .then(function(foundTheme) {
            foundTheme.name.should.equal('Affaires étrangères')
            done();
        })
        .catch(done);
    });

    it('should return no theme', function(done) {
        let searchedSubTheme = 'Politique nulle';
        BallotThemeHelper.findTheme(searchedSubTheme)
        .then(function(foundTheme) {
            should.exist(foundTheme);
            foundTheme.id.should.equal(BallotThemeHelper.CUSTOM_THEME_ID)
            foundTheme.name.should.equal(searchedSubTheme)
            done();
        })
        .catch(done);
    });
});
