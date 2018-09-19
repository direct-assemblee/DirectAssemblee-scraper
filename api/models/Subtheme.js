module.exports = {
    attributes: {
        id: {
            type: 'number',
            autoIncrement: true
        },
        name: {
            type: 'string',
            unique: true
        },
        theme: {
            model: 'Theme'
        }
    }
};
