module.exports = {
    primaryKey: 'id',
    attributes: {
        createdAt: { type: 'string', autoCreatedAt: true, },
        updatedAt: { type: 'string', autoUpdatedAt: true, },
        id: {
            type: 'number',
            autoIncrement: true
        },
        theme: {
            model: 'Theme'
        },
        originalThemeName: 'string',
        fileUrl: {
            type: 'string'
        },
        lastBallotDate: {
            type: 'string'
        },
    }
};
