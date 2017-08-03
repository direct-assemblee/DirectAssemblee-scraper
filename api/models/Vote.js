module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {
        id: {
            type: 'int',
            primaryKey: true,
            autoIncrement: true
        },
        value: {
            type: 'string'
        },
        ballotId: {
            type: 'int',
            model: 'Ballot'
        },
        deputyId: {
            type: 'int',
            model: 'Deputy'
        }
    }
}
