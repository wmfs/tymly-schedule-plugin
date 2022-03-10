const nodeSchedule = require('node-schedule')

class CronService {
  async boot (options) {
    this.statebox = options.bootedServices.statebox
    this.taskModel = options.bootedServices.storage.models.schedule_stateMachineSchedules
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
      expression,
      stateMachineName,
      sendResponse,
      input
    } = task

    task.job = nodeSchedule.scheduleJob(expression, () => {
      console.log(`Running scheduled state machine ${stateMachineName}`)
      const executionOptions = {
        instigatingClient: {
          appName: 'tymly',
          domain: 'tymly-cron-plugin'
        },
        sendResponse
      }
      const cb = async (err, executionDescription) => {
        await this.updateTaskLastRan(key, executionDescription.executionName)
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

  scheduleTask (statebox, schedule) {
    // const { stateMachineName, expression, input = {}, sendResponse = 'COMPLETE' } = schedule
    // this.messages.detail(`Scheduling state machine ${stateMachineName}`)
    //
    // return cron.schedule(
    //   expression,
    //   () => {
    //     this.messages.detail(`Running scheduled state machine ${stateMachineName}`)
    //     const executionOptions = {
    //       instigatingClient: {
    //         appName: 'tymly',
    //         domain: 'cron'
    //       },
    //       sendResponse
    //     }
    //     const cb = function (err, executionDescription) {
    //       // console.log({ err, executionDescription })
    //     }
    //     statebox.startExecution(input, stateMachineName, executionOptions, cb)
    //   },
    //   {
    //     scheduled: false,
    //     timezone: 'UTC'
    //   }
    // )
  } // scheduleTask

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
      // todo: persist to db
      // todo: expression or date?
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
      expression: config.expression,
      date: config.date,
      startOnBoot: config.startOnBoot
    })
  }

  updateTaskLastRan (key, executionName) {
    return this.taskModel.update(
      {
        key,
        lastRanTimestamp: new Date(),
        lastRanExecutionName: executionName
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
