module.exports = {
    attributes: {
        id: {
            type: 'number',
            autoIncrement: true
        },
        officialId: {
            type: 'number',
            unique: true
        },
        title: {
            type: 'json'
        },
        themeId: {
            model: 'Theme'
        },
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
