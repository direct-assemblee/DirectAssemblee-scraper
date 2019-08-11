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
        date: {
            type: 'string'
        },
        dateDetailed: {
            type: 'string'
        },
        type: {
            model: 'BallotType'
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
        lawId: {
            model: 'Law'
        }
    }
};
