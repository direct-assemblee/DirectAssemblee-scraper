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
        themeId: {
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
            type: 'string'
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
