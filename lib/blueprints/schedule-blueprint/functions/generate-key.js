const capitalise = str => str.charAt(0).toUpperCase() + str.slice(1)
const schema = 'schedule'

module.exports = function () {
  return function (event, env) {
    const now = env.bootedServices.timestamp.now()

    const key = [
      schema,
      event.trim().split(' ').map((n, i) => i === 0 ? n : capitalise(n)).join(''),
      now.format('YYYYMMDD-HHmm')
    ].join('_')

    return { key }
  }
}
