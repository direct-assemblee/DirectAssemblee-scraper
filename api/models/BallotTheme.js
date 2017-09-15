module.exports = {
    autoCreatedAt: false,
    autoUpdatedAt: false,
    attributes: {
        id: {
            type: 'int',
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: 'text'
        },
        typeName: {
            type: 'string'
        }
    }
};
