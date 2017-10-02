module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {
        id: {
            type: 'int',
            primaryKey: true,
            autoIncrement: true
        },
        label: {
            type: 'string'
        },
        text: 'text',
        workId: {
            type: 'int',
            model: 'Work'
        }
    }
};
