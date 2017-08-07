module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {
        id: {
            type: 'int',
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: 'string'
        },
        date: {
            type: 'date'
        },
        url: {
            type: 'string'
        },
        deputyId: {
            type: 'int',
            model: 'Deputy'
        }
    }
};
