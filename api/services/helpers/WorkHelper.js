let Constants = require('../Constants.js');

module.exports = {
    getWorkTypeName: function(workType) {
        let typeName;
        switch (workType) {
            case Constants.WORK_TYPE_QUESTIONS:
            typeName = Constants.DB_WORK_TYPE_QUESTIONS;
            break;
            case Constants.WORK_TYPE_REPORTS:
            typeName = Constants.DB_WORK_TYPE_REPORTS;
            break;
            case Constants.WORK_TYPE_PROPOSITIONS:
            typeName = Constants.DB_WORK_TYPE_PROPOSITIONS;
            break;
            case Constants.WORK_TYPE_COSIGNED_PROPOSITIONS:
            typeName = Constants.DB_WORK_TYPE_COSIGNED_PROPOSITIONS;
            break;
            case Constants.WORK_TYPE_COMMISSIONS:
            typeName = Constants.DB_WORK_TYPE_COMMISSIONS;
            break;
            case Constants.WORK_TYPE_PUBLIC_SESSIONS:
            typeName = Constants.DB_WORK_TYPE_PUBLIC_SESSIONS;
            break;
        }
        return typeName;
    }
}
