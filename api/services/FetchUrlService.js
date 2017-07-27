'use strict';

var Promise = require("bluebird");
var http = require('http');
var entities = require('html-entities').AllHtmlEntities;
var Constants = require('./Constants.js')

var httpGet = function(url, isIsoEncoding) {
    return new Promise(function(resolve, reject) {
        return http.get(url, function(res) {
            if (isIsoEncoding) {
                res.setEncoding('binary')
            } else {
                res.setEncoding('utf8');
            }
            var data = "";
            res.on('data', function (chunk) {
                if (chunk.startsWith("error")) {
                    console.log("--- error : " + url)
                    resolve();
                    return;
                } else {
                    data += chunk;
                }
            });
            res.on('end', function () {
                if (this.complete) {
                    resolve(data);
                    return;
                } else {
                    console.log("Incomplete response");
                    resolve();
                    return;
                }
            });
        })
        .on('error', function(e) {
            console.log("Got error: " + e.message);
            resolve();
            return;
        })
        .setTimeout(60000, function() {
            console.log("---- Timeout");
            resolve();
            return;
        });
    })
}

var self = module.exports = {
    retrieveContent: function(url) {
        return self.retrieveContent(url, false);
    },

    retrieveContent: function(url, isIsoEncoding) {
        return self.retrieveContentWithAttempt(url, isIsoEncoding, 0);
    },

    retrieveContentWithAttempt: function(url, isIsoEncoding, attemptNumber) {
        return httpGet(url, isIsoEncoding)
        .then(function(content) {
            if (content) {
                // console.log("    **** GOT " + content.length + "     " + url);
                if (content.length < 100) {
                    console.log(content)
                }
            } else {
                console.log(" ====> NO CONTENT ")
            }
            if (content == undefined || content.length < 1000) {
                console.log(content)
                if (content && content.startsWith("<head><title>Object moved</title></head>")) {
                    var index = content.indexOf("\"");
                    if (index > 0) {
                        var newUrl = content.substring(index + 1);
                        index = newUrl.indexOf("\"");
                        newUrl = Constants.BASE_URL + newUrl.substring(0, index);
                        return self.retrieveContentWithAttempt(newUrl, isIsoEncoding, 0);
                    }
                } else if (content > 100) {
                    console.log("--- RETRY : " + url)
                    attemptNumber++;
                    return self.retrieveContentWithAttempt(url, isIsoEncoding, attemptNumber);
                } else {
                    attemptNumber++;
                    console.log("--- RETRY (no content) : " + url)
                    if (attemptNumber < 3) {
                        return self.retrieveContentWithAttempt(url, isIsoEncoding, attemptNumber);
                    }
                }
            } else {
                return clean(content);
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
