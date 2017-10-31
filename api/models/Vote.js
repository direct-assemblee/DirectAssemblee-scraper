module.exports = {
    attributes: {
        id: {
            type: 'number',
            autoIncrement: true
        },
        value: {
            type: 'string'
        },
        ballotId: {
            model: 'Ballot'
        },
        deputyId: {
            model: 'Deputy'
        }
    }
};
