/* eslint-env mocha */

const expect = require('chai').expect
const tymly = require('@wmfs/tymly')
const path = require('path')

const scheduleKey = 'tymlyTest_twoSecondCatUpdates'

describe('Tymly schedule tests', function () {
  this.timeout(60000) // 60 second timeout

  before(function () {
    if (process.env.PG_CONNECTION_STRING && !/^postgres:\/\/[^:]+:[^@]+@(?:localhost|127\.0\.0\.1).*$/.test(process.env.PG_CONNECTION_STRING)) {
      console.log(`Skipping tests due to unsafe PG_CONNECTION_STRING value (${process.env.PG_CONNECTION_STRING})`)
      this.skip()
    }
  })

  let tymlyService
  let scheduleService
  let catStatsModel
  let taskModel
  let client

  let lastRunCount

  it('boot Tymly', async () => {
    const tymlyServices = await tymly.boot(
      {
        blueprintPaths: [
          path.resolve(__dirname, './fixtures/cats-blueprint')
        ],
        pluginPaths: [
          path.resolve(__dirname, '..'),
          require.resolve('@wmfs/tymly-pg-plugin'),
          require.resolve('@wmfs/tymly-test-helpers/plugins/mock-users-plugin')
        ]
      }
    )

    tymlyService = tymlyServices.tymly
    scheduleService = tymlyServices.schedule
    taskModel = tymlyServices.storage.models.schedule_task
    catStatsModel = tymlyServices.storage.models.tymlyTest_catStats
    client = tymlyServices.storage.client

    const catStats = await catStatsModel.find({})
    expect(catStats.length).to.eql(0)
  })

  it('check the task has persisted to the database', async () => {
    const tasks = await taskModel.find({})
    expect(tasks.length).to.eql(1)
    expect(tasks[0].scheduleType).to.eql('interval')
    expect(tasks[0].interval).to.eql('*/2 * * * * *')
    expect(tasks[0].datetime).to.eql(null)
    expect(tasks[0].status).to.eql('STARTED')
  })

  it('wait 10 seconds, let the updates run for a bit', done => setTimeout(done, 10000))

  it('stop cat updates', async () => {
    await scheduleService.stopTask(scheduleKey)
  })

  it('check the state machine has run multiple times', async () => {
    const tasks = await taskModel.find({})
    expect(tasks.length).to.eql(1)
    expect(tasks[0].scheduleType).to.eql('interval')
    expect(tasks[0].interval).to.eql('*/2 * * * * *')
    expect(tasks[0].datetime).to.eql(null)
    expect(tasks[0].status).to.eql('STOPPED')

    const executions = await scheduleService.findScheduledExecutions(scheduleKey)
    lastRunCount = executions.length

    // Waited 10 seconds and runs every 2 seconds so can be 5 or 6
    expect(lastRunCount).to.be.greaterThanOrEqual(5)
    expect(lastRunCount).to.be.lessThanOrEqual(6)

    const catStats = await catStatsModel.find({})
    expect(catStats.length).to.eql(lastRunCount)
  })

  it('wait 5 seconds', done => setTimeout(done, 5000))

  it('ensure scheduled task has not run again', async () => {
    const tasks = await taskModel.find({})
    expect(tasks.length).to.eql(1)
    expect(tasks[0].scheduleType).to.eql('interval')
    expect(tasks[0].interval).to.eql('*/2 * * * * *')
    expect(tasks[0].datetime).to.eql(null)
    expect(tasks[0].status).to.eql('STOPPED')

    const executions = await scheduleService.findScheduledExecutions(scheduleKey)
    expect(executions.length).to.eql(lastRunCount)

    const catStats = await catStatsModel.find({})
    expect(catStats.length).to.eql(lastRunCount)
  })

  it('update task to specific date/time', async () => {
    const datetime = new Date()
    datetime.setSeconds(datetime.getSeconds() + 10)

    await scheduleService.stopAndUpdateTaskSchedule(
      scheduleKey,
      {
        year: datetime.getFullYear(),
        month: datetime.getMonth(),
        date: datetime.getDate(),
        hour: datetime.getHours(),
        minute: datetime.getMinutes(),
        second: datetime.getSeconds()
      }
    )

    await scheduleService.startTask(scheduleKey)
  })

  it('wait 15 seconds', done => setTimeout(done, 15000))

  it('check the state machine has run once more', async () => {
    lastRunCount++

    const tasks = await taskModel.find({})
    expect(tasks.length).to.eql(1)
    expect(tasks[0].interval).to.eql(null)
    expect(tasks[0].datetime).to.not.eql(null)
    expect(tasks[0].scheduleType).to.eql('datetime')
    expect(tasks[0].status).to.eql('STARTED')

    const executions = await scheduleService.findScheduledExecutions(scheduleKey)
    expect(executions.length).to.eql(lastRunCount)

    const catStats = await catStatsModel.find({})
    expect(catStats.length).to.eql(lastRunCount)
  })

  it('wait 10 seconds', done => setTimeout(done, 10000))

  it('ensure scheduled task has not run again', async () => {
    const tasks = await taskModel.find({})
    expect(tasks.length).to.eql(1)
    expect(tasks[0].status).to.eql('STARTED')

    const executions = await scheduleService.findScheduledExecutions(scheduleKey)
    expect(executions.length).to.eql(lastRunCount)

    const catStats = await catStatsModel.find({})
    expect(catStats.length).to.eql(lastRunCount)
  })

  it('shutdown Tymly', async () => {
    await tymlyService.shutdown()
  })

  it('re-boot tymly', async () => {
    const tymlyServices = await tymly.boot(
      {
        blueprintPaths: [
          path.resolve(__dirname, './fixtures/cats-blueprint')
        ],
        pluginPaths: [
          path.resolve(__dirname, '..'),
          require.resolve('@wmfs/tymly-pg-plugin'),
          require.resolve('@wmfs/tymly-test-helpers/plugins/mock-users-plugin')
        ]
      }
    )

    tymlyService = tymlyServices.tymly
    scheduleService = tymlyServices.schedule
    taskModel = tymlyServices.storage.models.schedule_task
    catStatsModel = tymlyServices.storage.models.tymlyTest_catStats
    client = tymlyServices.storage.client
  })

  it('check blueprint tasks not overwritten updates', async () => {
    const tasks = await taskModel.find({})
    expect(tasks.length).to.eql(1)
    expect(tasks[0].key).to.eql(scheduleKey)
    expect(tasks[0].stateMachineName).to.eql('tymlyTest_sendCatUpdate')
    expect(tasks[0].scheduleType).to.eql('datetime')
    expect(tasks[0].interval).to.eql(null)
    expect(tasks[0].status).to.eql('STOPPED')

    const executions = await scheduleService.findScheduledExecutions(scheduleKey)
    expect(executions.length).to.eql(lastRunCount)
  })

  it('clean up data', async () => {
    await client.query('DROP SCHEMA tymly CASCADE;')
    await client.query('DROP SCHEMA tymly_test CASCADE;')
    await client.query('DROP SCHEMA schedule CASCADE;')
  })

  it('shutdown Tymly again', async () => {
    await tymlyService.shutdown()
  })
})
