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
        themeId: {
            model: 'Theme'
        }
    }
};
