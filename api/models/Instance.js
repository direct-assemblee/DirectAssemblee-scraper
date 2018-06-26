module.exports = {
    primaryKey: 'officialId',
    attributes: {
        officialId: {
            type: 'number',
            required: true,
            unique: true
        },
        name: {
            type: 'string'
        },
        typeId: {
            model: 'InstanceType'
        }
    }
};
