let Promise = require('bluebird');

module.exports = {
    createOrUpdate: function(instanceId, deputyId, roleTypeId) {
        let role = build(instanceId, deputyId, roleTypeId)
        return find(role)
        .then(function(foundRoles) {
            if (foundRoles && foundRoles.length > 0) {
                return update(foundRoles[0], role)
            } else {
                return create(role)
            }
        })
    }
}

let find = function(role) {
    return Role.find()
    .where({ instanceId: role.instanceId, deputyId: role.deputyId })
}

let create = function(role) {
    return Role.create(role)
}

let update = function(foundRole, role) {
    return Role.update()
    .where({ id: foundRole.id })
    .set(role)
}

let build = function(instanceId, deputyId, roleTypeId) {
    return {
        instanceId: instanceId,
        deputyId: deputyId,
        roleTypeId: roleTypeId
    }
}
