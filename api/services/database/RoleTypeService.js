let Promise = require('bluebird');

let allRoleTypes;

let self = module.exports = {
    find: async function(name) {
        if (allRoleTypes == null) {
            allRoleTypes = await self.retrieveAll()
        }
        return Promise.filter(allRoleTypes, function(roleType) {
            return typeFound(roleType, name)
        })
        .then(function(foundTypes) {
            if (foundTypes.length > 0) {
                return foundTypes[0].id
            }
        })
    },

    retrieveAll: function() {
        return RoleType.find()
    }
}

let typeFound = function(type, name) {
    name = name.replace('(', '').replace(')', '')
    return name.toLowerCase().startsWith(type.maleName.toLowerCase()) || name.toLowerCase().startsWith(type.femaleName.toLowerCase())
}
