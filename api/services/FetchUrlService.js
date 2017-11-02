'use strict';

let Promise = require('bluebird');
let http = require('http');
let Constants = require('./Constants.js')
let StringHelper = require('./helpers/StringHelper')

let httpGet = function(url, isIsoEncoding) {
    return new Promise(function(resolve, reject) {
        return http.get(url, function(res) {
            if (isIsoEncoding) {
                res.setEncoding('binary')
            } else {
                res.setEncoding('utf8');
            }
            let data = '';
            res.on('data', function (chunk) {
                if (chunk.startsWith('error')) {
                    console.log('--- error : ' + url)
                    resolve();
                } else {
                    data += chunk;
                }
            });
            res.on('end', function () {
                if (this.complete) {
                    resolve(data);
                } else {
                    console.log('Incomplete response');
                    resolve();
                }
            });
        })
        .on('error', function(e) {
            console.log('Got error: ' + e.message);
            resolve();
        })
        .setTimeout(60000, function() {
            console.log('---- Timeout');
            resolve();
        });
    })
}

let parseHtml = function(html, parser) {
    return new Promise(function(resolve, reject) {
        let p = parser.getParser(function(result) {
            html = null;
            p.end();
            p = null;
            resolve(result);
        })
        p.write(html);
    })
}

let self = module.exports = {
    retrieveContent: function(url, parser) {
        return self.retrieveContentWithIsoEncoding(url, false, parser);
    },

    retrieveContentWithIsoEncoding: function(url, isIsoEncoding, parser) {
        return self.retrieveContentWithAttempt(url, isIsoEncoding, 0, parser);
    },

    retrieveContentWithAttempt: function(url, isIsoEncoding, attemptNumber, parser) {
        return httpGet(url, isIsoEncoding)
        .then(function(content) {
            if (content === undefined || content.length < 1000) {
                console.log('content : ' + content);
                if (content && content.startsWith('<head><title>Object moved</title></head>')) {
                    let index = content.indexOf('\'');
                    if (index > 0) {
                        let newUrl = content.substring(index + 1);
                        index = newUrl.indexOf('\'');
                        newUrl = Constants.BASE_URL + newUrl.substring(0, index);
                        return self.retrieveContentWithAttempt(newUrl, isIsoEncoding, 0, parser);
                    }
                } else if (content > 100) {
                    console.log('--- RETRY : ' + url)
                    attemptNumber++;
                    return self.retrieveContentWithAttempt(url, isIsoEncoding, attemptNumber, parser);
                } else {
                    attemptNumber++;
                    console.log('--- RETRY (no content) : ' + url)
                    if (attemptNumber < 3) {
                        return self.retrieveContentWithAttempt(url, isIsoEncoding, attemptNumber, parser);
                    }
                }
            } else {
                return parseHtml(StringHelper.cleanHtml(content), parser);
            }
        })
    }
}
