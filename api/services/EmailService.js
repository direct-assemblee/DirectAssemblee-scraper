var api_key = 'key-ebbfc9eff23fa37391a2a2ed9684dc0f';
var DOMAIN = 'sandbox3a4906a7d94046d5b8d768acb8f615f4.mailgun.org';

var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});

module.exports = {
    sendNewThemeEmail: function (subtheme, done) {
        // Send an html email.
        console.log('Sending new email for subtheme : ' + subtheme);

        var data = {
            from: 'Theme Helper <themeHelper@directassemblee.fr>',
            to: 'morgane.plat@gmail.com',
            subject: 'Nouveau thème à gérer',
            text: 'Cher ami' + ',\nIl faut ajouter ce nouveau sous-thème : \n' + subtheme + '\n  \nSincerely,\nThe Management'
        };

        mailgun.messages().send(data, function (error, body) {
            if (error) {
                console.log('error sending email : ' + error);
            }
        });
    }
};
