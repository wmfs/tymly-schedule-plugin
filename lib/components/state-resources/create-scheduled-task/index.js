// const datetimeToRule = require('../../services/schedule/utils/datetime-to-rule')

class CreateScheduledTask {
  init (resourceConfig, env) {
    this.services = env.bootedServices
  }

  async run (event, context) {
    const {
      key,
      stateMachineName,
      scheduleType,
      datetime,
      interval
    } = event

    const stateMachineOk = this.services.schedule.checkIfStateMachineExists(stateMachineName)
    if (!stateMachineOk) {
      return context.sendTaskSuccess()
    }

    let input = typeof event.input === 'object'
      ? event.input
      : {}

    if (typeof event.input === 'string') {
      try {
        input = JSON.parse(event.input)
      } catch (err) {
        console.log('Issue with input', event.input)
      }
    }

    // const rule = scheduleType === 'interval'
    //   ? interval
    //   : datetimeToRule(new Date(datetime))

    const config = {
      stateMachineName,
      input,
      sendResponse: 'COMPLETE',
      scheduleType,
      interval,
      datetime,
      startOnBoot: false // todo
    }

    await this.services.schedule.createScheduledTask(key, config)
    // await this.services.schedule.stopAndUpdateTaskSchedule(key, rule)
    // await this.services.schedule.stopAndUpdateStateMachineConfig(key, stateMachineName, input)

    return context.sendTaskSuccess()
  }
}

module.exports = CreateScheduledTask
