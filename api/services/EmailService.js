var API_KEY = sails.config.mail.apiKey;
var DOMAIN = sails.config.mail.domain;

var mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: DOMAIN });

var sentMails = [];

module.exports = {
    sendNewSubThemeEmail: function (subtheme) {
        if (!sentMails.includes(subtheme)) {
            sentMails.push(subtheme);
            console.log('Sending email for new subtheme : ' + subtheme);
            var data = {
                from: 'Theme Helper <themeHelper@directassemblee.fr>',
                to: sails.config.mail.receiver,
                subject: 'Nouveau sous thème',
                text: 'Cher ami' + ',\nIl faut ajouter ce nouveau sous-thème : \n' + subtheme + '\n  \nSincerely,\nThe Management'
            };
            sendEmail(data);
        }
    },

    sendSubThemeTooLongEmail: function (subtheme) {
        if (!sentMails.includes(subtheme)) {
            sentMails.push(subtheme);
            console.log('Sending email for subtheme too long : ' + subtheme);
            var data = {
                from: 'Theme Helper <themeHelper@directassemblee.fr>',
                to: sails.config.mail.receiver,
                subject: 'Sous thème trop long',
                text: 'Cher ami' + ',\nCe thème est beaucoup trop long : \n' + subtheme + '\n  \nSincerely,\nThe Management'
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
