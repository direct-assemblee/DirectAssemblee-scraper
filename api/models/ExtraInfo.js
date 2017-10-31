module.exports = {
    attributes: {
        id: {
            type: 'number',
            autoIncrement: true
        },
        info: {
            type: 'string'
        },
        value: 'string',
        workId: {
            model: 'Work'
        }
    }
};
