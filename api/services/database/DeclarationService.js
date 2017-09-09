let Promise = require('bluebird');
let DateHelper = require('../helpers/DateHelper.js');

module.exports = {
    insertDeclarations: function(declarations, deputyId) {
        return clearDeclarationsForDeputy(deputyId)
        .then(function(removedDeclarations) {
            let number = removedDeclarations ? removedDeclarations.length : 0;
            console.log('removed ' + number + ' declarations');
            return createDeclarations(declarations, deputyId);
        })
    }
}

let clearDeclarationsForDeputy = function(deputyId) {
    return Declaration.destroy()
    .where({ deputyId: deputyId });
}

let createDeclarations = function(declarations, deputyId) {
    let promises = [];
    for (let i in declarations) {
        promises.push(createDeclaration(deputyId, declarations[i]));
    }
    return Promise.all(promises)
}

let createDeclaration = function(deputyId, declaration) {
    let declarationToInsert = createDeclarationModel(deputyId, declaration)
    return Declaration.create(declarationToInsert)
}

let createDeclarationModel = function(deputyId, declaration) {
    let date = DateHelper.formatWrittenDate(declaration.date)
    return {
        'title': declaration.title,
        'date': date,
        'url': declaration.url,
        'deputyId': deputyId
    }
}
