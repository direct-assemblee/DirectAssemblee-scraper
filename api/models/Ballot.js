module.exports = {
    primaryKey: 'officialId',
    attributes: {
        createdAt: { type: 'string', autoCreatedAt: true, },
        updatedAt: { type: 'string', autoUpdatedAt: true, },
        officialId: {
            type: 'number',
            required: true,
            unique: true
        },
        title: {
            type: 'json'
        },
        themeId: {
            model: 'Theme'
        },
        originalThemeName: 'string',
        date: {
            type: 'string'
        },
        dateDetailed: {
            type: 'string'
        },
        type: {
            type: 'string'
        },
        totalVotes: {
            type: 'number'
        },
        yesVotes: {
            type: 'number'
        },
        noVotes: {
            type: 'number'
        },
        nonVoting: {
            type: 'number'
        },
        isAdopted: {
            type: 'boolean'
        },
        analysisUrl: {
            type: 'string'
        },
        fileUrl: {
            type: 'string'
        }
    }
};
