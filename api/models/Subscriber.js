module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {
        id: {
            type: 'int',
            primaryKey: true,
            autoIncrement: true
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
