var Promise = require("bluebird");
var http = require('http');
var fs = require('fs');
var entities = require('html-entities').AllHtmlEntities;
var Constants = require('./Constants.js')

var httpGet = function(url, isIsoEncoding) {
  return new Promise(function(resolve, reject) {
    var retry = function(e) {
      console.log("Got error: " + e.message);
      return;
    }
    var retryAfterTimeout = function() {
      console.log("---- Timeout");
      return httpGet(url);
    }

    var req = http.get(url, function(res) {
      if (isIsoEncoding) {
        res.setEncoding('binary')
      } else {
        res.setEncoding('utf8');
      }
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

var self = module.exports = {
  retrieveContent: function(url) {
    return self.retrieveContent(url, false);
  },

  retrieveContent: function(url, isIsoEncoding) {
    // console.log(url);
    return httpGet(url, isIsoEncoding)
    .then(function(content) {
      var text = entities.decode(content);
      var cleaned = text.removeSpecialCharsBetter();
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
  .replace(/\s+/g, ' ')
  .replace(/\\n/g, ' ')
  .replace(/\\'/g, "\"")
  .replace(/\\"/g, '\"')
  .replace(/\\&/g, "")
  .replace(/\\r/g, "")
  .replace(/\\t/g, "")
  .replace(/\\b/g, "")
  .replace(/\\f/g, "")
  .replace(/\[dotspace\]/g, ".<br>");
};
