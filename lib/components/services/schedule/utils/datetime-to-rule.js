const moment = require('moment')

module.exports = function (datetime) {
  if (!(datetime instanceof Date)) {
    datetime = moment(datetime)
  }

  return {
<<<<<<< HEAD
    year: datetime.getFullYear(),
    month: datetime.getMonth(),
    date: datetime.getDate(),
    hour: datetime.getHours(),
    minute: datetime.getMinutes(),
    second: datetime.getSeconds()
=======
    year: parseInt(datetime.format('YYYY')),
    month: parseInt(datetime.format('M')) - 1,
    date: parseInt(datetime.format('D')),
    hour: parseInt(datetime.format('H')),
    minute: parseInt(datetime.format('m')),
    second: parseInt(datetime.format('s'))
>>>>>>> 440b061 (feat: commiting progress)
  }
}
