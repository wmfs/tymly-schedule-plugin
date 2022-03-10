const nodeSchedule = require('node-schedule')

class CronService {
  async boot (options) {
    this.statebox = options.bootedServices.statebox
    this.taskModel = options.bootedServices.storage.models.schedule_task
    this.scheduledTasks = await this.findTasks(options.blueprintComponents.stateMachineSchedules)

    for (const [key, task] of Object.entries(this.scheduledTasks)) {
      if (task.startOnBoot === true) {
        this.startTask(key)
      }
    }
  } // boot

  startTask (key) {
    const task = this.scheduledTasks[key]

    if (!task) {
      console.log(`Cannot find schedule task to start '${key}'`)
      return
    }

    const {
      rule,
      stateMachineName,
      sendResponse,
      input
    } = task

    // todo: timezone?

    task.job = nodeSchedule.scheduleJob({ rule }, () => {
      console.log(`Running scheduled state machine ${stateMachineName}`)
      const executionOptions = {
        instigatingClient: {
          appName: 'tymly',
          domain: 'tymly-cron-plugin'
        },
        sendResponse
      }
      const cb = async (err, executionDescription) => {
        await this.updateTaskOnExecution(key, executionDescription.executionName)
      }
      this.statebox.startExecution(input, stateMachineName, executionOptions, cb)
    })

    this.scheduledTasks[key] = task
  } // startTask

  stopTask (key) {
    const task = this.scheduledTasks[key]

    if (!task) {
      console.log(`Cannot find schedule task to stop '${key}'`)
      return
    }

    if (!task.job) {
      console.log(`Cannot find job on task to stop '${key}'`)
      return
    }

    task.job.cancel()
  } // stopTask

  stopTasks () {
    Object.keys(this.scheduledTasks).map(key => this.stopTask(key))
  } // stopTasks

  async findTasks (blueprintTasks) {
    const tasks = {}

    // From database
    const persistedTasks = await this.taskModel.find({})

    for (const task of persistedTasks) {
      // todo
      console.log('???', { task })
    }

    // From blueprint
    for (const [key, config] of Object.entries(blueprintTasks)) {
      if (tasks[key]) {
        continue
      }

      // todo: validate config
      // todo: rule or datetime?
      // todo: recurrence rules?

      console.log({ key, config })

      tasks[key] = config

      await this.persistTask(key, config)
    }

    return tasks
  } // findTasks

  persistTask (key, config) {
    return this.taskModel.create({
      key,
      stateMachineName: config.stateMachineName,
      input: config.input,
      sendResponse: config.sendResponse,
      rule: config.rule,
      datetime: config.datetime,
      startOnBoot: config.startOnBoot,
      lastRanTimestamp: null,
      lastRanExecutionName: null,
      totalRunCount: 0
    })
  }

  async updateTaskOnExecution (key, executionName) {
    const { totalRunCount } = await this.taskModel.findOne(
      {
        where: { key: { equals: key } },
        fields: ['totalRunCount']
      }
    )

    return this.taskModel.update(
      {
        key,
        lastRanTimestamp: new Date(),
        lastRanExecutionName: executionName,
        totalRunCount: totalRunCount + 1
      },
      {
        setMissingPropertiesToNull: false
      }
    )
  }

  stopAndUpdateTaskSchedule (key, rule) {
    this.stopTask(key)

    const updated = { key }

    if (typeof rule === 'string') {
      // todo: validate as cron syntax
      updated.rule = rule
      updated.datetime = null
    } else if (typeof rule === 'object') {
      const now = new Date()
      const datetime = new Date(
        rule.year || now.getFullYear(),
        rule.month || now.getMonth(),
        rule.date || now.getDate(),
        rule.hours || now.getHours(),
        rule.minutes || now.getMinutes(),
        rule.seconds || now.getSeconds()
      )
      updated.rule = null
      updated.datetime = datetime
    }

    return this.taskModel.update(updated, { setMissingPropertiesToNull: false })
  }

  async shutdown () {
    await nodeSchedule.gracefulShutdown()
  } // shutdown
} // class CronService

module.exports = {
  serviceClass: CronService,
  bootAfter: ['statebox']
}
