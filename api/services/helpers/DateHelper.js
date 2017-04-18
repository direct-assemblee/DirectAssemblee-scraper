var moment = require('moment');

var self = module.exports = {
  formatDate: function(dateString) {
    return self.formatDateWithTemplate(dateString, "DD/MM/YYYY");
  },

  formatWrittenDate: function(dateString) {
    return self.formatDateWithTemplate(dateString, "DD MMMM YYYY");
  },

  formatDateWithTemplate: function(dateString, formatTemplate) {
    moment.locale('fr')
    var parsedDate = moment(dateString, formatTemplate);
    return moment(parsedDate).format("YYYY-MM-DD");
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
  }
}
