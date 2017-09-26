var moment = require('moment');

const DATE_REGEX = /((0?[1-9]|[12][0-9]|3[01])[/-](0?[1-9]|1[012])[/-]\d{4})/g;
const DATE_WRITTEN_REGEX = /((0?[1-9]|[12][0-9]|3[01]|1er)\s.*\s\d{4})/g;
const BIRTHDATE_REGEX = /Né\sle\s((0?[1-9]|[12][0-9]|3[01]|1er)\s.*\s\d{4})/;

var self = module.exports = {
    BIRTHDATE_REGEX: BIRTHDATE_REGEX,
    DATE_REGEX: DATE_REGEX,

    findAndFormatDateInString: function(text, regex, parseTemplate) {
        var date;
        if (regex) {
            date = self.findDateWithRegex(text, regex);
            if (date) {
                date = self.formatDateWithTemplate(date, parseTemplate);
            }
        }
        if (!date) {
            date = self.findDateWithRegex(text, DATE_REGEX);
        }
        if (!date) {
            date = self.findDateWithRegex(text, DATE_WRITTEN_REGEX);
            if (date) {
                date = self.formatWrittenDate(date);
            }
        }
        return date;
    },

    findDateWithRegex: function(text, regex) {
        var date;
        if (text) {
            var dateMatched = text.toString().match(regex);
            if (dateMatched && dateMatched[0].length > 0) {
                date = dateMatched[0];
            }
        }
        return date;
    },

    formatDate: function(dateString) {
        return self.formatDateWithTemplate(dateString, 'DD/MM/YYYY');
    },

    formatWrittenDate: function(dateString) {
        return self.formatDateWithTemplate(dateString, 'DD MMMM YYYY');
    },

    formatDateWithTemplate: function(dateString, parseTemplate) {
        moment.locale('fr')
        var parsedDate = moment(dateString, parseTemplate);
        return moment(parsedDate).format('YYYY-MM-DD');
    },

    getDurationInDays: function(start, end) {
        var dur = 0;
        if (start && end) {
            dur = moment(end).diff(moment(start), 'days');
        }
        return dur;
    },

    convertDaysToYears: function(days) {
        return Math.floor(days / 365);
    },

    yesterday: function() {
        var yesterday = moment().subtract(1, 'days');
        return yesterday.format('DD/MM/YYYY');
    }
}
