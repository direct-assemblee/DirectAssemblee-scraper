module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {
        id: {
            type: 'int',
            primaryKey: true,
            autoIncrement: true
        },
        info: {
            type: 'string'
        },
        value: 'text',
        workId: {
            type: 'int',
            model: 'Work'
        }
    }
};
