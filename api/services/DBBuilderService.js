var Client = require('mariasql');
var execSQL = require('exec-sql');
var path = require('path');
var Promise = require("bluebird");

var client;

const DB_NAME = 'assembleenationale';
const DB_HOST = '127.0.0.1';
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

var getClient = function() {
  return new Client({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD
  });
}

var getClientWithDB = function(db) {
  return new Client({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    db: db
  });
}

var setNamesUtf8 = function(client) {
  makeQuery(client, 'SET NAMES UTF8');
}

var importSQLFiles = function(db) {
  execSQL.connect(db, DB_USER, DB_PASSWORD);
  execSQL.executeDirectory('assets/sql', function(err) {
      execSQL.disconnect();
      console.log('Done importing sql files');
  });
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

var makeQuery = function(client, query) {
  console.log(query)
  client.query(query, function(err, rows) {
    if (err) {
      throw err;
    }
    // console.dir(rows);
  });
}

module.exports = {
  resetDB: function() {
    client = getClientWithDB(DB_NAME);
    dropTables(client);
  },

  initDB: function() {
    client = getClientWithDB(DB_NAME);
    setNamesUtf8(client);
    importSQLFiles(DB_NAME);
  }
}
