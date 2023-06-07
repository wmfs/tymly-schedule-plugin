/* eslint-env mocha */

const expect = require('chai').expect

const moment = require('moment')
const ruleToDatetime = require('../lib/components/services/schedule/utils/rule-to-datetime')
const datetimeToRule = require('../lib/components/services/schedule/utils/datetime-to-rule')

describe('Rule to datetime tests', function () {
  it('No options, should default to now (UTC)', () => {
    const now = moment().utc().toDate()

    const datetime = ruleToDatetime()
    expect(datetime.getFullYear()).to.eql(now.getFullYear())
    expect(datetime.getMonth()).to.eql(now.getMonth())
    expect(datetime.getDate()).to.eql(now.getDate())
    expect(datetime.getHours()).to.eql(now.getHours())
    expect(datetime.getMinutes()).to.eql(now.getMinutes())
    expect(datetime.getSeconds()).to.eql(now.getSeconds())
  })

  it('Year only, the rest defaults to now', () => {
    let now = new Date()
    now = moment(now).utc().toDate()
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
    const now = new Date()
    const rule = {
      year: now.getFullYear(),
      month: now.getMonth(),
      date: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds()
    }

    const datetime = ruleToDatetime(rule)

    const utcTimestamp = moment(now).utc().toDate()

    expect(datetime.getFullYear()).to.eql(utcTimestamp.getFullYear())
    expect(datetime.getMonth()).to.eql(utcTimestamp.getMonth())
    expect(datetime.getDate()).to.eql(utcTimestamp.getDate())
    expect(datetime.getHours()).to.eql(utcTimestamp.getHours())
    expect(datetime.getMinutes()).to.eql(utcTimestamp.getMinutes())
    expect(datetime.getSeconds()).to.eql(utcTimestamp.getSeconds())
  })

  it('All options passed in as strings', () => {
    const now = new Date()
    const rule = {
      year: '' + now.getFullYear(),
      month: '' + now.getMonth(),
      date: '' + now.getDate(),
      hour: '' + now.getHours(),
      minute: '' + now.getMinutes(),
      second: '' + now.getSeconds()
    }

    const datetime = ruleToDatetime(rule)

    const utcTimestamp = moment(now).utc().toDate()

    expect(datetime.getFullYear()).to.eql(utcTimestamp.getFullYear())
    expect(datetime.getMonth()).to.eql(utcTimestamp.getMonth())
    expect(datetime.getDate()).to.eql(utcTimestamp.getDate())
    expect(datetime.getHours()).to.eql(utcTimestamp.getHours())
    expect(datetime.getMinutes()).to.eql(utcTimestamp.getMinutes())
    expect(datetime.getSeconds()).to.eql(utcTimestamp.getSeconds())
  })
})

describe('Datetime to rule tests', function () {
  it('No options, should default to now (UTC)', () => {
    const now = moment().utc()
    const rule = datetimeToRule()

    expect(rule.year).to.eql(now.year())
    expect(rule.month).to.eql(now.month())
    expect(rule.date).to.eql(now.date())
    expect(rule.hour).to.eql(now.hour())
    expect(rule.minute).to.eql(now.minute())
    expect(rule.second).to.eql(now.second())
  })

  it('DST test, should change time by +1 hour', () => {
    const lastMinuteOfGMT = new Date('Sunday March 27 2022 00:59:00')
    console.log(`last minute of GMT: ${lastMinuteOfGMT}`)

    let startOfBSTDateTime = moment(lastMinuteOfGMT).add(1, 'minutes').toDate()
    console.log(`start of BST: ${startOfBSTDateTime}`)

    // adding 1 min and setting as Date object
    const rule = datetimeToRule(new Date(lastMinuteOfGMT.getTime() + (60 * 1000)))

    startOfBSTDateTime = moment(startOfBSTDateTime).utc()
    expect(rule.date).to.eql(startOfBSTDateTime.date())
    expect(rule.hour).to.eql(startOfBSTDateTime.hour())
    expect(rule.minute).to.eql(startOfBSTDateTime.minute())
  })

  it('DST test, should change time by -1 hour', () => {
    const lastMinuteOfBST = new Date('Sunday October 30 2022 01:59:00')
    console.log(`last minute of BST: ${lastMinuteOfBST}`)

    let startOfGMTDateTime = moment(lastMinuteOfBST).add(1, 'minutes').toDate()
    console.log(`start of GMT: ${startOfGMTDateTime}`)

    // adding 1 min and setting as Date object
    const rule = datetimeToRule(new Date(lastMinuteOfBST.getTime() + (60 * 1000)))

    startOfGMTDateTime = moment(startOfGMTDateTime).utc()
    expect(rule.date).to.eql(startOfGMTDateTime.date())
    expect(rule.hour).to.eql(startOfGMTDateTime.hour())
    expect(rule.minute).to.eql(startOfGMTDateTime.minute())
  })
})
