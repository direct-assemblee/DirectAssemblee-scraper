let Client = require('mysql');
let FileHelper = require('./helpers/FileHelper.js');
let path = require('path');
let Promise = require('bluebird');

let client;

const DB_NAME = process.env.DATABASE_NAME || 'directassemblee';
const DB_HOST = process.env.DATABASE_HOST || 'localhost';
const DB_PORT = process.env.DATABASE_PORT || 3306;
const DB_USER = process.env.DATABASE_USER || 'root';
const DB_PASSWORD = process.env.DATABASE_PASSWORD || '';
const DB_ROOT_PASSWORD = process.env.DATABASE_ROOT_PASSWORD || '';

const TABLE_DEPARTMENT = 'Department';
const TABLE_DEPUTY = 'Deputy';
const TABLE_DEPUTY_INFOS = 'DeputyInfos';
const TABLE_DECLARATION = 'Declaration';
const TABLE_WORK = 'Work';
const TABLE_BALLOT = 'Ballot';
const TABLE_THEME = 'Theme';
const TABLE_VOTE = 'Vote';
const TABLE_MANDATE = 'Mandate';
const TABLE_EXTRA_POSITION = 'ExtraPosition';
const TABLE_EXTRA_INFO = 'ExtraInfo';
const TABLE_SUBSCRIBER = 'Subscriber';
const TABLE_DEPUTIES_SUBSCRIBERS = 'deputy_subscribers__subscriber_followeddeputiesids'

module.exports = {
    resetDB: function() {
        client = getClient(DB_NAME, false);
        dropTables(client);
    },

    initDB: function() {
        let rootedClient = getClient(DB_NAME, true);
        configDB(rootedClient);

        client = getClient(DB_NAME, false);
        return importSQLFiles(client);
    },

    shutdown: function() {
        if (client) {
            client.end();
        }
        return;
    }
}

let getClient = function(db, root) {
    let user = root ? 'root' : DB_USER;
    let pwd = root ? DB_ROOT_PASSWORD : DB_PASSWORD;
    let connection = Client.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: user,
        password: pwd,
        database: db,
        multipleStatements: true
    });
    connection.connect();
    return connection;
}

let configDB = function(client) {
    makeQuery(client, 'SET NAMES UTF8');
    makeQuery(client, 'SET GLOBAL sql_mode = \'\'');
}

let importSQLFiles = function(client) {
    let directory = 'assets/sql';
    let files = FileHelper.getFiles(directory);
    let tasks = [];
    return Promise.each(files, function(file) {
        return executeSQLFile(client, path.join(directory, file))
    })
    .then(function() {
        // execSQL.disconnect();
        console.log('Done importing sql files');
        return;
    })
}

let executeSQLFile = function(client, sqlFile) {
    let sql = FileHelper.getFileContent(sqlFile);
    return makeQueryPromise(client, sql);
}

let dropTables = function(client) {
    let query = 'DROP TABLE IF EXISTS ' + TABLE_DEPUTY_INFOS + ', ' + TABLE_SUBSCRIBER + ', ' + TABLE_DEPUTIES_SUBSCRIBERS;
    makeQuery(client, query);
    query = 'DROP TABLE IF EXISTS ' + TABLE_THEME + ', ' + TABLE_EXTRA_POSITION + ', ' + TABLE_EXTRA_INFO + ', ' + TABLE_WORK + ', ' + TABLE_DECLARATION + ', ' + TABLE_VOTE + ', ' + TABLE_MANDATE;
    makeQuery(client, query);
    query = 'DROP TABLE IF EXISTS ' + TABLE_BALLOT + ', ' + TABLE_DEPUTY + ', ' + TABLE_DEPUTY_INFOS;
    makeQuery(client, query);
    query = 'DROP TABLE IF EXISTS ' + TABLE_DEPARTMENT;
    makeQuery(client, query);
}

let makeQueryPromise = function(client, query) {
    return new Promise(function(resolve, reject) {
        client.query(query, function(err, rows) {
            if (err) {
                console.log(err)
                reject();
            }
            resolve();
        });
    });
}

let makeQuery = function(client, query) {
    console.log(query)
    client.query(query, function(err, rows) {
        if (err) {
            throw err;
        }
    });
}
