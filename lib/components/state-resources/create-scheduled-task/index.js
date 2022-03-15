class CreateScheduledTask {
  init (resourceConfig, env) {
    this.services = env.bootedServices
  }

  async run (key, context) {
    await this.services.schedule.createScheduledTask(key)

    return context.sendTaskSuccess()
  }
}

module.exports = CreateScheduledTask
