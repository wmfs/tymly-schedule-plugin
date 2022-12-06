const moment = require('moment')

module.exports = function (datetime) {
  if (!(datetime instanceof Date)) {
    datetime = new Date()
  }

  return {
    year: moment(datetime).year(),
    month: moment(datetime).month(),
    date: moment(datetime).date(),
    hour: moment(datetime).hour(),
    minute: moment(datetime).minute(),
    second: moment(datetime).second()
  }
}
