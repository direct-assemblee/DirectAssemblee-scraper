let Promise = require('bluebird');

let allTypes;

let self = module.exports = {
    find: async function(parsedName, parsedType) {
        if (allTypes == null) {
            allTypes = await self.retrieveAll()
        }
        return Promise.filter(allTypes, function(type) {
            return typeFound(type, parsedName, parsedType)
        })
        .then(function(foundTypes) {
            if (foundTypes.length > 0) {
                return foundTypes[0].id
            }
        })
    },

    retrieveAll: function() {
        return InstanceType.find()
    }
}

let typeFound = function(type, parsedName, parsedType) {
    if (parsedType.name.startsWith('Commission')) {
        if (parsedType.permanentCommission) {
            return type.singular == 'Commission permanente'
        } else {
            return type.singular == 'Commission (non permanente)'
        }
    } else {
        return parsedType.name.startsWith(type.plural) || parsedType.name.startsWith(type.singular)
    }
}
