let Promise = require('bluebird');
let StringHelper = require('../helpers/StringHelper');

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
    name = StringHelper.clean(name)
    return name.toLowerCase().startsWith(StringHelper.clean(type.maleName.toLowerCase()))
        || name.toLowerCase().startsWith(StringHelper.clean(type.femaleName.toLowerCase()))
}
