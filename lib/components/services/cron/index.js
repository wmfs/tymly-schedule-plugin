const cron = require('node-cron')
const Bree = require('bree')

class CronService {
  boot (options) {
    this.messages = options.messages
    this.messages.info('Cron State Machine Scheduler')
    this.scheduledStateMachines = this.findTasks(
      options.bootedServices.statebox,
      options.blueprintComponents.stateMachines
    )
    this.startTasks()


    const jobs = [
      {
        name: 'hello-world',
        interval: '2s',
        // cron: '*/2 * * * *'
      }
    ]

    const bree = new Bree({
      // root: false,
      jobs
    })

    bree.start()
  } // boot

  shutdown () {
    this.stopTasks()
  } // shutdown

  /*
  startTask (stateMachineName, expression) {
    const index = this.scheduledStateMachines.findIndex(s => s.stateMachineName === stateMachineName && s.expression === expression)

    if (index !== -1) {
      console.log(`State machine already started '${stateMachineName}' at '${expression}'`)
      return
    }

    if (typeof expression !== 'string' || !cron.validate(expression)) {
      console.log(`Schedule expression is not valid '${stateMachineName}' at '${expression}'`)
      return
    }

    console.log('????')
    // task.start()

          // schedule.stateMachineName = stateMachineName
          //     schedule.task = this.scheduleTask(statebox, schedule)
          //     acc.push(schedule)

  } // startTask
  */

  stopTask (stateMachineName, expression) {
    const index = this.scheduledStateMachines.findIndex(s => s.stateMachineName === stateMachineName && s.expression === expression)

    if (index === -1) {
      console.log(`Cannot find scheduled state machine '${stateMachineName}' at '${expression}'`)
      return
    }

    this.scheduledStateMachines[index].task.stop()
    this.scheduledStateMachines.splice(index, 1)
  } // stopTask

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
