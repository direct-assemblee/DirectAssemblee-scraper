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
        fileUrl: 'string',
        lastBallotDate: 'string',
        theme: {
            model: 'Theme'
        },
        typeId: {
            model: 'LawType'
        },
    }
};
