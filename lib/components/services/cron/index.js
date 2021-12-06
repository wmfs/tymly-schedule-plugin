const cron = require('node-cron')

// todo: try bree instead (uses worker threads)

class CronService {
  boot (options) {
    this.messages = options.messages
    this.messages.info('Cron State Machine Scheduler')
    this.scheduledStateMachines = this.findTasks(
      options.bootedServices.statebox,
      options.blueprintComponents.stateMachines
    )
    this.startTasks()
  } // boot

  shutdown () {
    this.stopTasks()
  } // shutdown

  startTasks () {
    this.scheduledStateMachines.forEach(({ stateMachineName, expression, task }) => {
      this.messages.detail(`Starting scheduled task for ${stateMachineName} ${expression}`)
      task.start()
    })
  } // startTasks

  stopTasks () {
    this.scheduledStateMachines.forEach(({ stateMachineName, expression, task }) => {
      this.messages.detail(`Stopping scheduled task for ${stateMachineName} ${expression}`)
      task.stop()
    })
  } // stopTasks

  scheduleTask (statebox, schedule) {
    const { stateMachineName, expression, input = {}, sendResponse = 'COMPLETE' } = schedule
    this.messages.detail(`Scheduling state machine ${stateMachineName}`)

    return cron.schedule(
      expression,
      () => {
        this.messages.detail(`Running scheduled state machine ${stateMachineName}`)
        const executionOptions = {
          instigatingClient: {
            appName: 'tymly',
            domain: 'cron'
          },
          sendResponse
        }
        const cb = function (err, executionDescription) {
          // console.log({ err, executionDescription })
        }
        statebox.startExecution(input, stateMachineName, executionOptions, cb)
      },
      {
        scheduled: false,
        timezone: 'UTC'
      }
    )
  } // scheduleTask

  findTasks (statebox, stateMachines = {}) {
    return Object
      .entries(stateMachines)
      .reduce((acc, [stateMachineName, config]) => {
        if (Array.isArray(config.schedule)) {
          for (const schedule of config.schedule) {
            if (schedule.expression && cron.validate(schedule.expression)) {
              schedule.stateMachineName = stateMachineName
              schedule.task = this.scheduleTask(statebox, schedule)
              acc.push(schedule)
            }
          }
        }
        return acc
      }, [])
  } // findTasks
} // class CronService

module.exports = {
  serviceClass: CronService,
  bootAfter: ['statebox']
}
