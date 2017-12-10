module.exports = {
    primaryKey: 'instanceId',
    attributes: {
        instanceId: {
            type: 'string',
            required: true
        },
        token: {
            type: 'string',
            unique: true
        },
        followedDeputiesIds: {
            collection: 'deputy',
            via: 'subscribers'
        }
    }
};
