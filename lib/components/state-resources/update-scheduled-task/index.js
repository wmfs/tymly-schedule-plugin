const datetimeToRule = require('../../services/schedule/utils/datetime-to-rule')

class UpdateScheduledTask {
  init (resourceConfig, env) {
    this.services = env.bootedServices
  }

  async run (event, context) {
    const {
      key,
      scheduleType,
      datetime,
      interval
    } = event

    const rule = scheduleType === 'interval'
      ? interval
      : datetimeToRule(new Date(datetime))

    await this.services.schedule.stopAndUpdateTaskSchedule(key, rule)

    return context.sendTaskSuccess()
  }
}

module.exports = UpdateScheduledTask
