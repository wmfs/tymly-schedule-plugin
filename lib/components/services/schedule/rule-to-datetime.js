module.exports = function (rule = {}) {
  const now = new Date()
  return new Date(
    isNaN(rule.year) ? now.getFullYear() : rule.year,
    isNaN(rule.month) ? now.getMonth() : rule.month,
    isNaN(rule.date) ? now.getDate() : rule.date,
    isNaN(rule.hours) ? now.getHours() : rule.hours,
    isNaN(rule.minutes) ? now.getMinutes() : rule.minutes,
    isNaN(rule.seconds) ? now.getSeconds() : rule.seconds
  )
}
