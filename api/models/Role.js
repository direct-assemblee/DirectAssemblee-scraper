module.exports = {
    attributes: {
        id: {
            type: 'number',
            autoIncrement: true
        },
        roleTypeId: {
            model: 'RoleType'
        },
        deputyId: {
            model: 'Deputy'
        },
        instanceId: {
            model: 'Instance'
        }
    }
};
