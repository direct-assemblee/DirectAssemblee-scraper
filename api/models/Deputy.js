module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {
        id: {
            type: 'int',
            primaryKey: true,
            autoIncrement: true
        },
        officialId: {
            type: 'int',
            unique: true
        },
        gender: {
            type: 'string'
        },
        firstname: {
            type: 'string'
        },
        lastname: {
            type: 'string'
        },
        parliamentGroup: {
            type: 'string'
        },
        departmentId: {
            type: 'int'
        },
        district: {
            type: 'int'
        },
        commission: {
            type: 'string'
        },
        phone: {
            type: 'string'
        },
        email: {
            type: 'string'
        },
        job: {
            type: 'string'
        },
        currentMandateStartDate: {
            type: 'date'
        },
        mandateEndDate: {
            type: 'date'
        },
        mandateEndReason: {
            type: 'string'
        },
        seatNumber: {
            type: 'int'
        },
        subscribers: {
            collection: 'subscriber',
            via: 'followedDeputiesIds',
            dominant: true
        }
    }
};
