module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    'globals': {
       '_': true,
       'sails': true,
       'async': true,
       'server': true,

       'Constants': true,
       'Ballot': true,
       'Declaration': true,
       'Department': true,
       'Deputy': true,
       'ExtraInfo': true,
       'Mandate': true,
       'ShortTheme': true,
       'Subscriber': true,
       'Subtheme': true,
       'Vote': true,
       'Work': true,

       'AssembleeScrapingService': true,
       'FetchUrlService': true,
       'DBBuilderService': true,
       'RequestService': true,
       'ShortThemeService': true,
       'ThemeHelper': true
    },
    "rules": {
        "no-console":0,
        "semi": 0,
        "linebreak-style": [
            "warn",
            "unix"
        ],
        "quotes": [
            "warn",
            "single"
        ],
        "no-unused-vars":0
    }
};
