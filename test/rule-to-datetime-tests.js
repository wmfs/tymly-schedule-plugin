/* eslint-env mocha */

const expect = require('chai').expect

const ruleToDatetime = require('../lib/components/services/schedule/rule-to-datetime')

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
      hours: 12,
      minutes: 30,
      seconds: 0
    }

    const datetime = ruleToDatetime(rule)

    expect(datetime.getFullYear()).to.eql(rule.year)
    expect(datetime.getMonth()).to.eql(rule.month)
    expect(datetime.getDate()).to.eql(rule.date)
    expect(datetime.getHours()).to.eql(rule.hours)
    expect(datetime.getMinutes()).to.eql(rule.minutes)
    expect(datetime.getSeconds()).to.eql(rule.seconds)
  })

  it('All options passed in as strings', () => {
    const rule = {
      year: '2020',
      month: '1',
      date: '2',
      hours: '12',
      minutes: '30',
      seconds: '0'
    }

    const datetime = ruleToDatetime(rule)

    expect(datetime.getFullYear().toString()).to.eql(rule.year)
    expect(datetime.getMonth().toString()).to.eql(rule.month)
    expect(datetime.getDate().toString()).to.eql(rule.date)
    expect(datetime.getHours().toString()).to.eql(rule.hours)
    expect(datetime.getMinutes().toString()).to.eql(rule.minutes)
    expect(datetime.getSeconds().toString()).to.eql(rule.seconds)
  })
})
