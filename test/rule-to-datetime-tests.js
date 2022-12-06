/* eslint-env mocha */

const expect = require('chai').expect

const moment = require('moment')
const ruleToDatetime = require('../lib/components/services/schedule/utils/rule-to-datetime')
const datetimeToRule = require('../lib/components/services/schedule/utils/datetime-to-rule')

describe('Rule to datetime tests', function () {
  it('No options, should default to now', () => {
    const now = new Date()
    const datetime = ruleToDatetime()

    expect(datetime.getFullYear()).to.eql(now.getFullYear())
    expect(datetime.getMonth()).to.eql(now.getMonth())
    expect(datetime.getDate()).to.eql(now.getDate())
    expect(datetime.getHours()).to.eql(now.getHours())
    expect(datetime.getMinutes()).to.eql(now.getMinutes())
    expect(datetime.getSeconds()).to.eql(now.getSeconds())
  })

  it('Year only, the rest defaults to now', () => {
    const now = new Date()
    const year = now.getFullYear() + 2

    const datetime = ruleToDatetime({ year })

    expect(datetime.getFullYear()).to.eql(year)
    expect(datetime.getMonth()).to.eql(now.getMonth())
    expect(datetime.getDate()).to.eql(now.getDate())
    expect(datetime.getHours()).to.eql(now.getHours())
    expect(datetime.getMinutes()).to.eql(now.getMinutes())
    expect(datetime.getSeconds()).to.eql(now.getSeconds())
  })

  it('All options passed in as integers', () => {
    const rule = {
      year: 2020,
      month: 1,
      date: 2,
      hour: 12,
      minute: 30,
      second: 0
    }

    const datetime = ruleToDatetime(rule)

    expect(datetime.getFullYear()).to.eql(rule.year)
    expect(datetime.getMonth()).to.eql(rule.month)
    expect(datetime.getDate()).to.eql(rule.date)
    expect(datetime.getHours()).to.eql(rule.hour)
    expect(datetime.getMinutes()).to.eql(rule.minute)
    expect(datetime.getSeconds()).to.eql(rule.second)
  })

  it('All options passed in as strings', () => {
    const rule = {
      year: '2020',
      month: '1',
      date: '2',
      hour: '12',
      minute: '30',
      second: '0'
    }

    const datetime = ruleToDatetime(rule)

    expect(datetime.getFullYear().toString()).to.eql(rule.year)
    expect(datetime.getMonth().toString()).to.eql(rule.month)
    expect(datetime.getDate().toString()).to.eql(rule.date)
    expect(datetime.getHours().toString()).to.eql(rule.hour)
    expect(datetime.getMinutes().toString()).to.eql(rule.minute)
    expect(datetime.getSeconds().toString()).to.eql(rule.second)
  })
})

describe('Datetime to rule tests', function () {
  it('No options, should default to now', () => {
    const now = moment()
    const rule = datetimeToRule()

    expect(rule.year).to.eql(now.year())
    expect(rule.month).to.eql(now.month())
    expect(rule.date).to.eql(now.date())
    expect(rule.hour).to.eql(now.hour())
    expect(rule.minute).to.eql(now.minute())
    expect(rule.second).to.eql(now.second())
  })

  it('Specific year, the rest should default to now', () => {
    let datetime = new Date()
    const year = datetime.getFullYear() + 2
    datetime.setFullYear(year)

    const rule = datetimeToRule(datetime)
    datetime = moment(datetime)

    expect(rule.year).to.eql(year)
    expect(rule.month).to.eql(datetime.month())
    expect(rule.date).to.eql(datetime.date())
    expect(rule.hour).to.eql(datetime.hour())
    expect(rule.minute).to.eql(datetime.minute())
    expect(rule.second).to.eql(datetime.second())
  })

  it('DST test, should change time by +1 hour', () => {
    const currentDateTime = new Date('Sunday March 27 2022 00:59:00')

    // 2022-03-27T02:00:00+01:00
    const startDSTDateTime = moment(currentDateTime).add(1, 'minutes')

    // adding 1 min and setting as Date object
    const rule = datetimeToRule(new Date(currentDateTime.getTime() + (60 * 1000)))

    expect(rule.date).to.eql(startDSTDateTime.date())
    expect(rule.hour).to.eql(startDSTDateTime.hour())
    expect(rule.minute).to.eql(startDSTDateTime.minute())
  })

  it('DST test, should change time by -1 hour', () => {
    const currentDateTime = new Date('Sunday October 30 2022 01:59:00')

    // 2022-10-30T01:00:00+00:00
    const endDSTDateTime = moment(currentDateTime).add(1, 'minutes')

    // adding 1 min and setting as Date object
    const rule = datetimeToRule(new Date(currentDateTime.getTime() + (60 * 1000)))

    expect(rule.date).to.eql(endDSTDateTime.date())
    expect(rule.hour).to.eql(endDSTDateTime.hour())
    expect(rule.minute).to.eql(endDSTDateTime.minute())
  })
})
