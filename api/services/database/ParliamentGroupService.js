let Promise = require('bluebird');

let allParliamentGroups;

let self = module.exports = {
    find: async function(name) {
        if (allParliamentGroups == null) {
            allParliamentGroups = await self.retrieveAll()
        }
        return Promise.filter(allParliamentGroups, function(parliamentGroup) {
            return typeFound(parliamentGroup, name)
        })
        .then(function(foundTypes) {
            if (foundTypes.length > 0) {
                return foundTypes[0].id
            }
        })
    },

    retrieveAll: function() {
        return ParliamentGroup.find()
    }
}

let typeFound = function(group, searchedGroup) {
    return group.name == searchedGroup
}
