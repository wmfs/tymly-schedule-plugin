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
      scheduleType,
      rule,
      datetime,
      stateMachineName,
      sendResponse,
      input
    } = task

    const jobOptions = scheduleType === 'rule'
      ? { rule }
      : { datetime }

    task.job = nodeSchedule.scheduleJob({ ...jobOptions, tz: 'UTC' }, () => {
      console.log(`Running scheduled state machine ${stateMachineName}`)
      const startedAt = new Date()
      const executionOptions = {
        instigatingClient: {
          appName: 'tymly',
          domain: 'tymly-schedule-plugin'
        },
        sendResponse
      }
      const cb = async (err, executionDescription) => {
        await this.updateTaskOnExecution(key, executionDescription.executionName, startedAt)
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
      // todo: recurrence rules?

      if (typeof config.rule === 'string') {
        config.scheduleType = 'rule'
      } else if (typeof config.rule === 'object') {
        config.scheduleType = 'datetime'
        config.datetime = this.ruleToDatetime(config.rule)
      }

      tasks[key] = config

      await this.persistTask(key, config)
    }

    return tasks
  } // findTasks

  ruleToDatetime (rule) {
    const now = new Date()
    return new Date(
      rule.year || now.getFullYear(),
      rule.month || now.getMonth(),
      rule.date || now.getDate(),
      rule.hours || now.getHours(),
      rule.minutes || now.getMinutes(),
      rule.seconds || now.getSeconds()
    )
  }

  persistTask (key, config) {
    return this.taskModel.create({
      key,
      stateMachineName: config.stateMachineName,
      input: config.input,
      sendResponse: config.sendResponse,
      scheduleType: config.scheduleType,
      rule: config.rule,
      datetime: config.datetime,
      startOnBoot: config.startOnBoot,
      lastRanStart: null,
      lastRanEnd: null,
      lastRanExecutionName: null,
      totalRunCount: 0
    })
  }

  async updateTaskOnExecution (key, executionName, startedAt) {
    const { totalRunCount } = await this.taskModel.findOne(
      {
        where: { key: { equals: key } },
        fields: ['totalRunCount']
      }
    )

    return this.taskModel.update(
      {
        key,
        lastRanStart: startedAt,
        lastRanEnd: new Date(),
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

    if (typeof rule === 'string') {
      // todo: validate as cron syntax
      this.scheduledTasks[key].rule = rule
      this.scheduledTasks[key].datetime = null
      this.scheduledTasks[key].scheduleType = 'rule'
    } else if (typeof rule === 'object') {
      this.scheduledTasks[key].rule = null
      this.scheduledTasks[key].datetime = this.ruleToDatetime(rule)
      this.scheduledTasks[key].scheduleType = 'datetime'
    }

    return this.taskModel.update(
      {
        key,
        rule: this.scheduledTasks[key].rule,
        datetime: this.scheduledTasks[key].datetime,
        scheduleType: this.scheduledTasks[key].scheduleType
      },
      {
        setMissingPropertiesToNull: false
      }
    )
  }

  async shutdown () {
    await nodeSchedule.gracefulShutdown()
  } // shutdown
} // class CronService

module.exports = {
  serviceClass: CronService,
  bootAfter: ['statebox']
}
