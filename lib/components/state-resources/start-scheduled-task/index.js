class StartScheduledTask {
  init (resourceConfig, env) {
    this.services = env.bootedServices
  }

  async run (key, context) {
    await this.services.schedule.startTask(key)
    return context.sendTaskSuccess()
  }
}

module.exports = StartScheduledTask
