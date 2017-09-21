var Mailgun = require('machinepack-mailgun');

module.exports = {
    sendNewThemeEmail: function (subtheme, done) {
        // Send an html email.
        console.log("Sending new email for subtheme : " + subtheme);
        Mailgun.sendHtmlEmail({
            apiKey: 'key-ebbfc9eff23fa37391a2a2ed9684dc0f',
            domain: 'sandbox3a4906a7d94046d5b8d768acb8f615f4.mailgun.org',
            toEmail: 'morgane.plat@gmail.com',
            toName: '',
            subject: 'Nouveau thème à gérer',
            textMessage: 'Cher ami' + ',\nIl faut ajouter ce nouveau sous-thème : \n' + subtheme + '\n  \nSincerely,\nThe Management',
            htmlMessage: 'Cher ami' + ',<br><br><p>Il faut ajouter ce nouveau sous-thème : <br>' + subtheme +  '</p><br/><span>Sincerely,</span><br/><strong>The Management</strong>',
            fromEmail: 'themeHelper@directassemblee.fr',
            fromName: 'ThemeHelper',
        }).exec(function (err) {

        });
    }
};
