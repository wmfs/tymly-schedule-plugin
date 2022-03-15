module.exports = function (rule = {}) {
  const now = new Date()
  return new Date(
    isNaN(rule.year) ? now.getFullYear() : rule.year,
    isNaN(rule.month) ? now.getMonth() : rule.month,
    isNaN(rule.date) ? now.getDate() : rule.date,
    isNaN(rule.hour) ? now.getHours() : rule.hour,
    isNaN(rule.minute) ? now.getMinutes() : rule.minute,
    isNaN(rule.second) ? now.getSeconds() : rule.second
  )
}
