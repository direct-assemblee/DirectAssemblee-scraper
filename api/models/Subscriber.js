module.exports = {
    attributes: {
        id: {
            type: 'number',
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
