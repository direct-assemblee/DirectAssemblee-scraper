var Promise = require("bluebird");
var DateHelper = require('../helpers/DateHelper.js');

module.exports = {
    insertDeclarations: function(declarations, deputyId) {
        return clearDeclarationsForDeputy(deputyId)
        .then(function(removedDeclarations) {
            return createDeclarations(declarations, deputyId)
        })
    }
}

var clearDeclarationsForDeputy = function(deputyId) {
    return Declaration.destroy()
    .where({ deputyId: deputyId });
}

var createDeclarations = function(declarations, deputyId) {
    var promises = [];
    for (i in declarations) {
        promises.push(createDeclaration(deputyId, declarations[i]));
    }
    return Promise.all(promises)
}

var createDeclaration = function(deputyId, declaration) {
    var declarationToInsert = createDeclarationModel(deputyId, declaration)
    return Declaration.create(declarationToInsert)
}

var createDeclarationModel = function(deputyId, declaration) {
    var date = DateHelper.formatWrittenDate(declaration.date)
    return {
        "title": declaration.title,
        "date": date,
        "url": declaration.url,
        "deputyId": deputyId
    }
}
