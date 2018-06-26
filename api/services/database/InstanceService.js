let Promise = require('bluebird');

module.exports = {
    retrieveAll: function() {
        return Instance.find()
    },

    createOrUpdate: function(instance) {
        let inst = build(instance)
        return find(inst)
        .then(function(foundInstance) {
            if (foundInstance) {
                return update(foundInstance, inst)
            } else {
                return create(inst)
            }
        })
    }
}

let find = function(instance) {
    return Instance.findOne()
    .where({ officialId: instance.officialId })
}

let create = function(instance) {
    return Instance.create(instance)
    .meta({ fetch: true })
    .then(function(inserted) {
        return inserted.officialId
    })
}

let update = function(foundInstance, instance) {
    return Instance.update()
    .where({ officialId: foundInstance.officialId })
    .set(instance)
    .meta({ fetch: true })
    .then(function(inserted) {
        return inserted[0].officialId
    })
    .catch(err => {
        console.log('Error updating instance ' + err);
        return
    });
}

let build = function(instance) {
    return {
        officialId: instance.officialId,
        name: instance.name,
        typeId: instance.typeId
    }
}
