require('../../../bootstrap');
let ThemeHelper = require('../../../../api/services/helpers/ThemeHelper.js')

describe('The ThemeHelper', function () {
    it('should return correct theme', function(done) {
        ThemeHelper.findTheme('Politique extérieure')
        .then(function(foundTheme) {
            foundTheme.name.should.equal('Affaires étrangères')
            done();
        })
        .catch(done);
    });

    it('should return no theme', function(done) {
        let searchedSubTheme = 'Politique nulle';
        ThemeHelper.findTheme(searchedSubTheme)
        .then(function(foundTheme) {
            should.exist(foundTheme);
            foundTheme.id.should.equal(ThemeHelper.CUSTOM_THEME_ID)
            foundTheme.name.should.equal(searchedSubTheme)
            done();
        })
        .catch(done);
    });
});
