var moment = require('moment');

module.exports = {
  formatDate: function(dateString) {
    var parsedDate = moment(dateString, 'DD/MM/YYYY');
    return moment(parsedDate).format("YYYY-MM-DD");
  }
}
