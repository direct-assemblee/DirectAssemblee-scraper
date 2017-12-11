module.exports = {
    attributes: {
        id: {
            type: 'number',
            autoIncrement: true
        },
        fullName: {
            type: 'string',
            unique: true
        },
        shortName: {
            type: 'string'
        }
    }
};
