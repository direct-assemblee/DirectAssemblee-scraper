module.exports = {
    attributes: {
        id: {
            type: 'number',
            autoIncrement: true
        },
        name: {
            type: 'json'
        },
        startingDate: {
            type: 'string'
        },
        endingDate: {
            type: 'string'
        },
        deputyId: {
            model: 'Deputy'
        }
    }
};
