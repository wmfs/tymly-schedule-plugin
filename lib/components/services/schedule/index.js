const nodeSchedule = require('node-schedule')
const ruleToDatetime = require('./rule-to-datetime')
const datetimeToRule = require('./datetime-to-rule')

class CronService {
  async boot (options) {
    this.statebox = options.bootedServices.statebox
    this.taskModel = options.bootedServices.storage.models.schedule_task
    this.scheduledTasks = await this.findTasks(options.blueprintComponents.stateMachineSchedules)

    for (const [key, task] of Object.entries(this.scheduledTasks)) {
      if (task.startOnBoot === true) {
        await this.startTask(key)
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
      interval,
      datetime,
      stateMachineName,
      sendResponse,
      input
    } = task

    const jobOptions = {
      tz: 'UTC'
    }

    if (scheduleType === 'interval') {
      jobOptions.rule = interval
    } else if (scheduleType === 'datetime') {
      const rule = this.datetimeToRule(datetime)

      Object
        .entries(rule)
        .forEach(([key, value]) => {
          jobOptions[key] = value
        })
    }

    // todo: allow window for start/end datetimes

    task.job = nodeSchedule.scheduleJob(
      jobOptions,
      () => {
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
          if (err) {
            console.log(`There was an error on execution of scheduled state machine ${stateMachineName}`)
          }
          await this.updateTaskOnExecution(key, executionDescription.executionName, startedAt)
        }
        this.statebox.startExecution(input, stateMachineName, executionOptions, cb)
      }
    )

    this.scheduledTasks[key] = task

    return this.updateTaskStatus(key, 'STARTED')
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

    return this.updateTaskStatus(key, 'STOPPED')
  } // stopTask

  updateTaskStatus (key, status) {
    return this.taskModel.update(
      {
        key,
        status
      },
      {
        setMissingPropertiesToNull: false
      }
    )
  }

  stopTasks () {
    return Promise.all(
      Object.keys(this.scheduledTasks).map(key => this.stopTask(key))
    )
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

      // todo: recurrence rules?

      if (typeof config.interval === 'string') {
        config.scheduleType = 'interval'
        config.datetime = null
        // todo: validate interval
      } else if (typeof config.rule === 'object') {
        config.scheduleType = 'datetime'
        config.datetime = this.ruleToDatetime(config.rule)
        config.interval = null
      }

      tasks[key] = config

      await this.persistTask(key, config)
    }

    return tasks
  } // findTasks

  ruleToDatetime (rule) {
    return ruleToDatetime(rule)
  }

  datetimeToRule (datetime) {
    return datetimeToRule(datetime)
  }

  persistTask (key, config) {
    return this.taskModel.create({
      key,
      stateMachineName: config.stateMachineName,
      input: config.input,
      sendResponse: config.sendResponse,
      scheduleType: config.scheduleType,
      interval: config.interval,
      datetime: config.datetime,
      startOnBoot: config.startOnBoot,
      lastRanStart: null,
      lastRanEnd: null,
      lastRanExecutionName: null,
      totalRunCount: 0,
      status: null
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

  async stopAndUpdateTaskSchedule (key, rule) {
    await this.stopTask(key)

    if (typeof rule === 'string') {
      // todo: validate interval
      this.scheduledTasks[key].interval = rule
      this.scheduledTasks[key].datetime = null
      this.scheduledTasks[key].scheduleType = 'interval'
    } else if (typeof rule === 'object') {
      this.scheduledTasks[key].interval = null
      this.scheduledTasks[key].datetime = this.ruleToDatetime(rule)
      this.scheduledTasks[key].scheduleType = 'datetime'
    }

    return this.taskModel.update(
      {
        key,
        interval: this.scheduledTasks[key].interval,
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
