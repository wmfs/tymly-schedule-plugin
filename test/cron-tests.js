/* eslint-env mocha */

const expect = require('chai').expect
const tymly = require('@wmfs/tymly')
const path = require('path')
const STATE_MACHINE_NAME = 'tymlyTest_sendCatUpdate'

describe('Cron tests', function () {
  this.timeout(60000) // 60 second timeout

  let tymlyService, cronService, statebox, catStatsModel, executionsModel

  it('boot Tymly', async () => {
    const tymlyServices = await tymly.boot(
      {
        blueprintPaths: [
          path.resolve(__dirname, './fixtures/cats-blueprint')
        ],
        pluginPaths: [
          path.resolve(__dirname, '..')
        ]
      }
    )

    tymlyService = tymlyServices.tymly
    cronService = tymlyServices.cron
    statebox = tymlyServices.statebox
    catStatsModel = tymlyServices.storage.models.tymlyTest_catStats
    executionsModel = tymlyServices.storage.models.tymly_execution

    const catStats = await catStatsModel.find({})
    expect(catStats.length).to.eql(0)
  })

  it('wait 10 seconds', (done) => {
    setTimeout(done, 10000)
  })

  it('check the state machine has run multiple times', async () => {
    const catStats = await catStatsModel.find({})
    // Waited 10 seconds and runs every 2 seconds so can be 5 or 6
    expect(catStats.length).to.be.greaterThanOrEqual(5)
    expect(catStats.length).to.be.lessThanOrEqual(6)
  })

  it('shutdown Tymly', async () => {
    await tymlyService.shutdown()
  })

  it('wait 5 seconds', (done) => {
    setTimeout(done, 5000)
  })

  it('ensure scheduled task has not run again', async () => {
    const catStats = await catStatsModel.find({})
    expect(catStats.length).to.be.lessThan(7)
  })
})
