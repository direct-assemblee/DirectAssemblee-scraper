var api_key = 'key-ebbfc9eff23fa37391a2a2ed9684dc0f';
var DOMAIN = 'sandbox3a4906a7d94046d5b8d768acb8f615f4.mailgun.org';

var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});

var sentMails = [];

module.exports = {
    sendNewThemeEmail: function (subtheme) {
        if (!sentMails.includes(subtheme)) {
            sentMails.push(subtheme);
            console.log('Sending new email for subtheme : ' + subtheme);
            var data = {
                from: 'Theme Helper <themeHelper@directassemblee.fr>',
                to: 'morgane.plat@gmail.com',
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
                from: 'Theme Helper <themeHelper@directassemblee.fr>',
                to: 'morgane.plat@gmail.com',
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
