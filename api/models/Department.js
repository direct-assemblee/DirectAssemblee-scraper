module.exports = {
    autoCreatedAt: false,
    autoUpdatedAt: false,
    attributes: {
        id: {
            type: 'int',
            primaryKey: true,
            autoIncrement: true
        },
        code: {
            type: 'string'
        },
        name: {
            type: 'string'
        },
        nameUppercase: {
            type: 'string'
        },
        slug: {
            type: 'string'
        },
        soundexName: {
            type: 'string'
        }
    }
}
