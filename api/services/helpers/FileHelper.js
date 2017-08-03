var fs = require('fs')
var path = require('path')

module.exports = {
    getFiles: function(directory) {
        var toReturn = []
        var fileRegex = new RegExp('^.+[.]sql$', 'g')
        var files = fs.readdirSync(directory)
        files.forEach(function(file) {
            if (file.match(fileRegex) !== null){
                toReturn.push(file)
            }
        })
        return toReturn
    },

    getFileContent: function(file) {
        return fs.readFileSync(file).toString()
    }
}
