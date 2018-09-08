Direct Assemblée - server side : the scraper
===============

This application retrieves public data from [the Assemblée Nationale website](http://www.assemblee-nationale.fr/) :
- the deputies and their works : written questions, reports, law proposals, participations to commissions and public sessions
- the current mandate ballots, and all deputies votes

The data is stored in a MySQL database, and can be served with the [api application](https://github.com/direct-assemblee/DirectAssemblee-api).

## Setup

### Building the code

1. Install the development environment :

- Install [Node.js](https://nodejs.org/en/download/package-manager/)
- Install [npm5](https://www.npmjs.com/package/npm5
- Install [sails](https://sailsjs.com/get-started) :
    ```shell
    npm install -g sails
    ```

2. Clone the repository:
    ```shell
    git clone <URL>
    ```

3. Install the project dependencies:
    ```shell
    npm install
    ```

4. Launch the scraper :
    ```shell
    sails lift
    ```

5. This project uses [Mailgun](https://www.mailgun.com/) to send mails when a new theme needs to be treated. See **Mailgun** section below to configure project.

###  Mailgun

This project uses Mailgun.

Works and ballots are associated to a theme. However, there is no static theme list that can be found on the Assemblée Nationale website. We need to maintain our own theme list in the database : `Theme` table. We also have a `ShortTheme` table that we use to shorten the long themes in order to have them display nicely on a mobile device.

Everytime a new theme is scraped, the app sends us a new mail so we can manually add it to our database.

If you want to keep this feature, you should register your own Mailgun account and generate a `domain` and an `api key` that you will store in `config/env/production.js` and `config/env/development.js`
    ```shell
    mail: {
      apiKey: 'key-xxx',
      domain: 'sandboxxxx.mailgun.org',
      receiver: 'xxx@xxx.xxx'
    }
    ```

##  Contribute

Pull requests are more than welcome ! If you want to do it, use a feature branch and please make sure to use a descriptive title and description for your pull request.

Unfortunately, the project doesn't have any unit tests yet, so it can take a while to make sure there is no regression in your pull request.


## License

Direct Assemblée scraper is under the AGPLv3.

See  [LICENSE](https://github.com/direct-assemblee/DirectAssemblee-scraper/blob/master/LICENSE)  for more license info.

## Contact

For any question or if you need help, you can send contact us at contact@direct-assemblee.org.
