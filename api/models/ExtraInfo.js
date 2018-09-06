module.exports = {
    attributes: {
        id: {
            type: 'number',
            autoIncrement: true
        },
        info: {
            type: 'string'
        },
        value: 'json',
        workId: {
            model: 'Work'
        }
    }
};
