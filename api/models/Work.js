module.exports = {
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
            type: 'string'
        },
        description: {
            type: 'json'
        },
        type: {
            type: 'string'
        },
        deputyId: {
            model: 'Deputy'
        }
    }
};
