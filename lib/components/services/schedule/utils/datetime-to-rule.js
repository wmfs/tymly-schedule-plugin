module.exports = function (datetime) {
  if (!(datetime instanceof Date)) {
    datetime = new Date()
  }

  return {
    year: datetime.getFullYear(),
    month: datetime.getMonth(),
    date: datetime.getDate(),
    hour: datetime.getHours() - 1,
    minute: datetime.getMinutes(),
    second: datetime.getSeconds()
  }
}
