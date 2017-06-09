var Promise = require("bluebird");
var http = require('http');
var fs = require('fs');
var entities = require('html-entities').AllHtmlEntities;
var Constants = require('./Constants.js')

var httpGet = function(url, isIsoEncoding) {
  return new Promise(function(resolve, reject) {
    var retry = function(e) {
      console.log("Got error: " + e.message);
      resolve(httpGet(url));
    }
    var retryAfterTimeout = function() {
      console.log("---- Timeout");
      resolve(httpGet(url));
    }

    var req = http.get(url, function(res) {
      if (isIsoEncoding) {
        res.setEncoding('binary')
      } else {
        res.setEncoding('utf8');
      }
      var data = "";
      res.on('data', function (chunk) {
        if (chunk.startsWith("error")) {
          console.log("--- retry : " + url)
          resolve(httpGet(url));
        } else {
          data += chunk;
        }
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
      return clean(content)
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

var clean = function(content) {
  var cleaned = content.replace(/&quot;/g, "\'");
  cleaned = entities.decode(cleaned);
  cleaned = cleaned.removeSpecialCharsBetter();
  return cleaned
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
  .replace("&quot;", "")
  .replace("data-place", "dataplace")
  .replace(/\[dotspace\]/g, ".<br>");
};
