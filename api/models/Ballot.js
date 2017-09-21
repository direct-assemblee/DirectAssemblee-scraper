module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {
        id: {
            type: 'int',
            primaryKey: true,
            autoIncrement: true
        },
        officialId: {
            type: 'int',
            unique: true
        },
        title: {
            type: 'text'
        },
        themeId: {
            type: 'int',
            model: 'Theme'
        },
        date: {
            type: 'date'
        },
        dateDetailed: {
            type: 'string'
        },
        type: {
            type: 'string'
        },
        totalVotes: {
            type: 'int'
        },
        yesVotes: {
            type: 'int'
        },
        noVotes: {
            type: 'int'
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
