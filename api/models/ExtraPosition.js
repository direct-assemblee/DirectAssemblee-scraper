module.exports = {
    attributes: {
        id: {
            type: 'number',
            autoIncrement: true
        },
        position: {
            type: 'string'
        },
        office: {
            type: 'string'
        },
        type: {
            type: 'string'
        },
        deputyId: {
            model: 'Deputy'
        }
    }
};
