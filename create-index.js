var settings = require('./settings.js')
var events = require('events')

var CreateIndex = function (db) {
  if (settings.index.disabled) {
    return console.info('Creation of the index is disabled in the settings')
  }
  
  var createIndex = new events.EventEmitter()

  createIndex.addTweet = function (tweet) {
    var record = new db.Index({
      trigger: 'tweet',
      triggerId: tweet.id,
      date: new Date(tweet.created_at),
      weight: parseFloat(tweet.user.followers_count),
      theIndex: createIndex.theIndex
    })

    record.save(function (err) {
      if(!settings.db.writeEnabled) {
        if (err) console.error('Error on save!', err, record)
        createIndex.calculateIndexFromDatabase()
        return createIndex.emit('add-tweet-error', err)
      }
      return createIndex.emit('add-tweet-error', 'DB Write disabled')
    })
    createIndex.emit('tweetAdded', record, createIndex.getIndex())
  }

  createIndex.calculateIndexFromDatabase = function (accountId) {
    var thisCutOff = new cutOff()
    return db.Index.aggregate([{
      $match: {
        date: {
          $gte: thisCutOff
        }
      }
    }, {
      $group: {
        _id: '$trigger',
        amount: {
          $sum: 1
        },
        weight: {
          $sum: '$weight'
        },
        average: {
          $avg: '$weight'
        }
      }
    }], function (err, result) {
      if (err || !result[0]) {
        console.error('calculateIndexFromDatabase', err, result)
        return createIndex.emit('calculate-index-from-database-error', err, result)
      }
      createIndex.emit('index-calculated-from-database', result)
      createIndex.setIndex(result[0].weight)
    })
  }

  cutOff = function () {
    return new Date(Date.now() - settings.index.timeSpanToCalculateOver)
  }

  createIndex.getIndex = function () {
    return createIndex.theIndex
  }

  createIndex.setIndex = function (number) {
    createIndex.theIndex = parseFloat((number / 1000) - 50).toFixed(2)
    createIndex.emit('index-changed', createIndex.getIndex())
  }

  createIndex.calculateIndexFromDatabase()

  return createIndex
}

module.exports = CreateIndex
