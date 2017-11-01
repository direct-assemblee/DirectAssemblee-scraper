module.exports = {
    attributes: {
        id: {
            type: 'number',
            autoIncrement: true
        },
        title: {
            type: 'json'
        },
        themeId: {
            model: 'Theme'
        },
        tempTheme: 'string',
        date: {
            type: 'string'
        },
        url: {
            type: 'string'
        },
        description: {
            type: 'json'
        },
        type: {
            type: 'string'
        },
        deputyId: {
            model: 'Deputy'
        }
    }
};
