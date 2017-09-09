let fs = require('fs');

module.exports = {
    getFiles: function(directory) {
        let toReturn = [];
        let fileRegex = new RegExp('^.+[.]sql$', 'g');
        let files = fs.readdirSync(directory);
        files.forEach(function(file) {
            if (file.match(fileRegex) !== null){
                toReturn.push(file);
            }
        });
        return toReturn;
    },

    getFileContent: function(file) {
        return fs.readFileSync(file).toString();
    }
}
