/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  // models: {
  //   connection: 'someMongodbServer'
  // }

  mail {
    apiKey: 'key-ebbfc9eff23fa37391a2a2ed9684dc0f'
    domain: 'sandbox3a4906a7d94046d5b8d768acb8f615f4.mailgun.org'
    receiver: 'morgane.plat@gmail.com'
  }
};
