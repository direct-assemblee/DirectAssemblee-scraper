var API_KEY = sails.config.mail.apiKey;
var DOMAIN = sails.config.mail.domain;

var mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: DOMAIN });

var sentMails = [];

module.exports = {
    sendNewThemeEmail: function (subtheme) {
        if (!sentMails.includes(subtheme)) {
            sentMails.push(subtheme);
            console.log('Sending new email for subtheme : ' + subtheme);
            var data = {
                from: 'Theme Helper <themeHelper@directassemblee.fr>',
                to: sails.config.mail.receiver,
                subject: 'Nouveau thème',
                text: 'Cher ami' + ',\nIl faut ajouter ce nouveau sous-thème : \n' + subtheme + '\n  \nSincerely,\nThe Management'
            };
            sendEmail(data);
        }
    },

    sendThemeTooLongEmail: function (theme) {
        if (!sentMails.includes(theme)) {
            sentMails.push(theme);
            console.log('Sending new email for theme too long : ' + theme);
            var data = {
                from: 'Theme Helper <theme.helper@directassemblee.fr>',
                to: sails.config.mail.receiver,
                subject: 'Thème trop long',
                text: 'Cher ami' + ',\nCe thème est beaucoup trop long : \n' + theme + '\n  \nSincerely,\nThe Management'
            };
            sendEmail(data);
        }
    }
};

let sendEmail = function(data) {
    mailgun.messages().send(data, function (error, body) {
        if (error) {
            console.log('error sending email : ' + error);
        }
    });
}
