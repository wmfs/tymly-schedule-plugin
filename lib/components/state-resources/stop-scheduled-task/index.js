class StopScheduledTask {
  init (resourceConfig, env) {
    this.services = env.bootedServices
  }

  async run (key, context) {
    await this.services.schedule.stopTask(key)
    return context.sendTaskSuccess()
  }
}

module.exports = StopScheduledTask
