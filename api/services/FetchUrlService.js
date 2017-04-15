var Promise = require("bluebird");
var http = require('http');
var fs = require('fs');
var entities = require('html-entities').AllHtmlEntities;
var Constants = require('./Constants.js')

var httpGet = function(url) {
  return new Promise(function(resolve, reject) {
    var retry = function(e) {
      console.log("Got error: " + e.message);
      return httpGet(url);
    }
    var retryAfterTimeout = function() {
      console.log("---- Timeout");
      return httpGet(url);
    }

    var req = http.get(url, function(res) {
      var data = "";
      res.on('data', function (chunk) {
        data += chunk;
      });
      res.on('end', function () {
        if (this.complete) {
          resolve(data);
        } else {
          retry( { message: "Incomplete response" } );
        }
      });
    }).on('error', retry)
    .setTimeout(30000, retryAfterTimeout);
  })
}

module.exports = {
  retrieveContent: function(url) {
    // console.log(url);
    return httpGet(url)
    .then(function(content) {
      var text = entities.decode(content);
      var cleaned = text.removeSpecialCharsBetter();
      // console.log(cleaned)
      return cleaned
    });
  },

  retrievePhoto: function(url) {
    var filename = url.split('/').pop();
    var filepath = Constants.SAVE_PHOTO_PATH + filename;
    fs.exists(filepath, function(exists) {
      if (!exists) {
        // console.log("downloading photo")
        http.get(url, function(res) {
          res.pipe(fs.createWriteStream(filepath));
        });
      } else {
        // console.log("photo already exists")
      }
    })
  }
}

String.prototype.removeSpecialCharsBetter = function() {
  return this.replace(/\.\r\n/g, "[dotspace]")
  .replace(/\s\s+/g, ' ')
  .replace(/\\n/g, " ")
  .replace(/\\'/g, "\"")
  .replace(/\\"/g, '\"')
  .replace(/\\&/g, "")
  .replace(/\\r/g, "")
  .replace(/\\t/g, "")
  .replace(/\\b/g, "")
  .replace(/\\f/g, "")
  .replace(/\[dotspace\]/g, ".<br>");
};
