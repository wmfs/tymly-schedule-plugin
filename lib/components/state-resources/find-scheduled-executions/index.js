class FindScheduledExecutions {
  init (resourceConfig, env) {
    this.services = env.bootedServices
  }

  async run (key, context) {
    const executions = await this.services.schedule.findScheduledExecutions(key)
    return context.sendTaskSuccess(executions)
  }
}

module.exports = FindScheduledExecutions
