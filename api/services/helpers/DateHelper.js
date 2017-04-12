var moment = require('moment');

module.exports = {
  formatDate: function(dateString) {
    var parsedDate = moment(dateString, 'DD/MM/YYYY');
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
