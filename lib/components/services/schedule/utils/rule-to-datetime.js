const moment = require('moment')

module.exports = function (rule = {}) {
  const now = new Date()
  const date = new Date(
    isNaN(rule.year) ? now.getFullYear() : rule.year,
    isNaN(rule.month) ? now.getMonth() : rule.month,
    isNaN(rule.date) ? now.getDate() : rule.date,
    isNaN(rule.hour) ? now.getHours() : rule.hour,
    isNaN(rule.minute) ? now.getMinutes() : rule.minute,
    isNaN(rule.second) ? now.getSeconds() : rule.second
  )
  // note that rule does not specify a timezone, so we have to assume that
  // the timestamp provided is a local timestamp - as such, we have to convert
  // to UTC.  note that in British Summer Time (for example, on the 5th June),
  // now.getTimezoneOffset() will return -60.
  return moment(date).add(now.getTimezoneOffset(), 'minutes').toDate()
}
