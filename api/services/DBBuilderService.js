var Client = require('mariasql');
var FileHelper = require('./helpers/FileHelper.js');
var path = require('path');
var Promise = require("bluebird");

var client;

const DB_NAME = 'directassemblee';
const DB_HOST = process.env.DATABASE_HOST || 'localhost';
const DB_PORT = 3306;
const DB_USER = 'root';
const DB_PASSWORD = '';

const TABLE_DEPARTMENT = 'Department';
const TABLE_DEPUTY = "Deputy";
const TABLE_DEPUTY_INFOS = "DeputyInfos";
const TABLE_DECLARATION = "Declaration";
const TABLE_WORK = "Work";
const TABLE_BALLOT = "Ballot";
const TABLE_VOTE = "Vote";
const TABLE_MANDATE = "Mandate";
const TABLE_EXTRA_POSITION = "ExtraPosition";
const TABLE_SUBSCRIBER = 'Subscriber';
const TABLE_DEPUTIES_SUBSCRIBERS = 'deputy_subscribers__subscriber_followeddeputiesids'

module.exports = {
  resetDB: function() {
    client = getClientWithDB(DB_NAME);
    dropTables(client);
  },

  initDB: function() {
    client = getClientWithDB(DB_NAME);
    setNamesUtf8(client);
    importSQLFiles(client);
  }
}

var getClient = function() {
  return new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD
  });
}

var getClientWithDB = function(db) {
  return new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    db: db,
    multiStatements: true
  });
}

var setNamesUtf8 = function(client) {
  makeQuery(client, 'SET NAMES UTF8');
  makeQuery(client, 'SET GLOBAL sql_mode = \"\"');
}

var importSQLFiles = function(client) {
  var directory = 'assets/sql';
  var files = FileHelper.getFiles(directory);
  var tasks = [];
  files.forEach(function(file) {
    tasks.push(executeSQLFile(client, path.join(directory, file)));
  });
  return Promise.all(tasks)
  .then(function() {
    // execSQL.disconnect();
    console.log('Done importing sql files');
  })
}

var executeSQLFile = function(client, sqlFile) {
  var sql = FileHelper.getFileContent(sqlFile);
  return makeQueryPromise(client, sql);
}

var dropTables = function(client) {
  var query = 'DROP TABLE IF EXISTS ' + TABLE_DEPUTY_INFOS + ', ' + TABLE_SUBSCRIBER + ', ' + TABLE_DEPUTIES_SUBSCRIBERS;
  makeQuery(client, query);
  var query = 'DROP TABLE IF EXISTS ' + TABLE_EXTRA_POSITION + ', ' + TABLE_WORK + ', ' + TABLE_DECLARATION + ', ' + TABLE_VOTE + ', ' + TABLE_MANDATE;
  makeQuery(client, query);
  var query = 'DROP TABLE IF EXISTS ' + TABLE_BALLOT + ', ' + TABLE_DEPUTY + ', ' + TABLE_DEPUTY_INFOS;
  makeQuery(client, query);
  var query = 'DROP TABLE IF EXISTS ' + TABLE_DEPARTMENT;
  makeQuery(client, query);
}

var makeQueryPromise = function(client, query) {
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

var makeQuery = function(client, query) {
  console.log(query)
  client.query(query, function(err, rows) {
    if (err) {
      throw err;
    }
    // console.dir(rows);
  });
}
