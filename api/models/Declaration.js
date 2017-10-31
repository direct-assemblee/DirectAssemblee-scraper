module.exports = {
    attributes: {
        id: {
            type: 'number',
            autoIncrement: true
        },
        title: {
            type: 'string'
        },
        date: {
            type: 'string'
        },
        url: {
            type: 'string'
        },
        deputyId: {
            model: 'Deputy'
        }
    }
};
