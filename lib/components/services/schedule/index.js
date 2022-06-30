const INSTIGATING_CLIENT_DOMAIN = 'tymly-schedule-plugin'

const nodeSchedule = require('node-schedule')
const ruleToDatetime = require('./utils/rule-to-datetime')
const datetimeToRule = require('./utils/datetime-to-rule')
const { v4: uuidv4 } = require('uuid')

class CronService {
  async boot (options) {
    this.statebox = options.bootedServices.statebox
    this.taskModel = options.bootedServices.storage.models.schedule_task
    this.executionModel = options.bootedServices.storage.models.tymly_execution

    // todo: rename blueprint component to scheduled-tasks, blueprint component to have "type": "stateMachineName"
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
      const rule = datetimeToRule(datetime)

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
        const executionOptions = {
          instigatingClient: {
            appName: 'tymly',
            domain: INSTIGATING_CLIENT_DOMAIN,
            scheduleKey: key
          },
          sendResponse
        }
        const cb = async (err, executionDescription) => {
          if (err) {
            console.log(`There was an error on execution of scheduled state machine ${stateMachineName}`)
          }
        }
        this.statebox.startExecution(input, stateMachineName, executionOptions, cb)
      }
    )

    this.scheduledTasks[key] = task

    return this.updateTaskStatus(key, task.job === null ? 'STOPPED' : 'STARTED')
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
  } // updateTaskStatus

  stopTasks () {
    return Promise.all(
      Object.keys(this.scheduledTasks).map(key => this.stopTask(key))
    )
  } // stopTasks

  async findTasks (blueprintTasks = {}) {
    const tasks = {}

    // From database
    const persistedTasks = await this.taskModel.find({})

    for (const config of persistedTasks) {
      tasks[config.key] = config
    }

    // From blueprint
    for (const [key, config] of Object.entries(blueprintTasks)) {
      if (tasks[key]) {
        continue
      }

      const stateMachineOk = this.checkIfStateMachineExists(config.stateMachineName)
      if (!stateMachineOk) {
        continue
      }

      // todo: recurrence rules?

      if (typeof config.interval === 'string') {
        config.scheduleType = 'interval'
        config.datetime = null
      } else if (typeof config.rule === 'object') {
        config.scheduleType = 'datetime'
        config.datetime = ruleToDatetime(config.rule)
        config.interval = null
      }

      config.input = typeof config.input === 'object'
        ? config.input
        : {}

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
      scheduleType: config.scheduleType,
      interval: config.interval,
      datetime: config.datetime,
      startOnBoot: config.startOnBoot,
      status: null
    })
  } // persistTask

  checkIfStateMachineExists (stateMachineName) {
    const [stateMachineOk, errStateMachineDesc] = this.statebox.checkIfStateMachineExists(stateMachineName)

    if (!stateMachineOk) {
      console.log('State machine error', errStateMachineDesc)
    }

    return stateMachineOk
  } // checkIfStateMachineExists

  async stopAndUpdateStateMachineConfig (key, stateMachineName, input) {
    await this.stopTask(key)

    const stateMachineOk = this.checkIfStateMachineExists(stateMachineName)
    if (!stateMachineOk) {
      return
    }

    this.scheduledTasks[key].stateMachineName = stateMachineName
    this.scheduledTasks[key].input = typeof input === 'object'
      ? input
      : {}

    return this.taskModel.update(
      {
        key,
        stateMachineName: this.scheduledTasks[key].stateMachineName,
        input: this.scheduledTasks[key].input
      },
      {
        setMissingPropertiesToNull: false
      }
    )
  } // stopAndUpdateStateMachineConfig

  async stopAndUpdateTaskSchedule (key, rule) {
    await this.stopTask(key)

    if (typeof rule === 'string') {
      this.scheduledTasks[key].interval = rule
      this.scheduledTasks[key].datetime = null
      this.scheduledTasks[key].scheduleType = 'interval'
    } else if (typeof rule === 'object') {
      this.scheduledTasks[key].interval = null
      this.scheduledTasks[key].datetime = ruleToDatetime(rule)
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
  } // stopAndUpdateTaskSchedule

  async findScheduledExecutions (key) {
    const executions = await this.executionModel.find({
      fields: [
        'executionName',
        'executionOptions',
        'status',
        'created',
        'modified'
      ],
      where: {
        stateMachineName: {
          equals: this.scheduledTasks[key].stateMachineName
        }
      },
      orderBy: ['-modified']
    })

    return executions.filter(({ executionOptions }) => {
      executionOptions = typeof executionOptions === 'string'
        ? JSON.parse(executionOptions)
        : executionOptions

      return executionOptions.instigatingClient.domain === INSTIGATING_CLIENT_DOMAIN &&
        executionOptions.instigatingClient.scheduleKey === key
    })
  } // findScheduledExecutions

  createScheduledTask (key, config = {}) {
    if (key === null) {
      console.log('no key, generating...')
      key = uuidv4()
    }
    this.scheduledTasks[key] = config
    return this.persistTask(key, config)
  } // createScheduledTask

  async shutdown () {
    await nodeSchedule.gracefulShutdown()
  } // shutdown
} // class CronService

module.exports = {
  serviceClass: CronService,
  bootAfter: ['statebox']
}
