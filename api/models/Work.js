module.exports = {
    primaryKey: 'id',
    attributes: {
        createdAt: { type: 'string', autoCreatedAt: true, },
        updatedAt: { type: 'string', autoUpdatedAt: true, },
        id: {
            type: 'number',
            autoIncrement: true
        },
        name: 'string',
        subthemeId: {
            model: 'Subtheme'
        },
        unclassifiedTemporaryTheme: 'string',
        date: 'string',
        url: {
            type: 'string',
            unique: true
        },
        description: {
            type: 'json'
        },
        subtypeId: {
            model: 'WorkSubtype'
        },
        authors: {
            collection: 'deputy',
            via: 'workCreations'
        },
        participants: {
            collection: 'deputy',
            via: 'workParticipations'
        }
    }
};
