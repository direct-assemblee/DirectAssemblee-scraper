module.exports = {
    attributes: {
        id: {
            type: 'number',
            autoIncrement: true
        },
        name: 'string',
        parentTypeId: {
            model: 'WorkType'
        }
    }
};
