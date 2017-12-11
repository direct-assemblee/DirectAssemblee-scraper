module.exports = {
    findShortThemes: function() {
        return ShortTheme.find();
    },
    
    findShortTheme: function(themeOriginalName) {
        return ShortTheme.findOne({ fullName: themeOriginalName })
        .then(function(theme) {
            if (theme) {
                return theme.shortName;
            }
        })
    }
}
