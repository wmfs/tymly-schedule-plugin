class UpdateScheduledStateMachineConfig {
  init (resourceConfig, env) {
    this.services = env.bootedServices
  }

  async run (event, context) {
    const {
      key,
      stateMachineName
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

    await this.services.schedule.stopAndUpdateStateMachineConfig(key, stateMachineName, input)

    return context.sendTaskSuccess()
  }
}

module.exports = UpdateScheduledStateMachineConfig
