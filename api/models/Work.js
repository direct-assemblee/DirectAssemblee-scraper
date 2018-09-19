module.exports = {
    primaryKey: 'id',
    attributes: {
        createdAt: { type: 'string', autoCreatedAt: true, },
        updatedAt: { type: 'string', autoUpdatedAt: true, },
        id: {
            type: 'number',
            autoIncrement: true
        },
        title: {
            type: 'json'
        },
        theme: {
            model: 'Theme'
        },
        tempTheme: 'string',
        originalThemeName: 'string',
        date: {
            type: 'string'
        },
        url: {
            type: 'string',
            unique: true
        },
        description: {
            type: 'json'
        },
        type: {
            model: 'WorkType'
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
