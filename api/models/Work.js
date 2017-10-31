module.exports = {
    attributes: {
        id: {
            type: 'number',
            autoIncrement: true
        },
        title: {
            type: 'string'
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
