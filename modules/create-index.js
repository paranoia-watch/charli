var events = require('events')

var CreateIndex = function (settings, db) {
  if (settings.disabled) {
    console.info('Creation of the index is disabled in the settings')
    return false
  }
  if (!settings.timeSpanToCalculateOver) {
    console.info('There is no timeSpanToCalculateOver specified')
    return false
  }

  var cutOff = function () {
    return new Date(Date.now() - settings.timeSpanToCalculateOver)
  }

  var createIndex = new events.EventEmitter()

  createIndex.addTweet = function (tweet) {
    if (!db) return createIndex.emit('add-tweet-error', 'No DB connected')
    var record = new db.Index({
      trigger: 'tweet',
      triggerId: tweet.id,
      date: new Date(tweet.created_at),
      weight: parseFloat(tweet.user.followers_count),
      theIndex: createIndex.theIndex
    })

    if (!db.settings.writeEnabled)
      return createIndex.emit('add-tweet-error', 'DB Write disabled')

    record.save(function (error) {
      if (error) return createIndex.emit('add-tweet-error', err)
      return createIndex.calculateIndexFromDatabase()
    })
    createIndex.emit('tweetAdded', record, createIndex.getIndex())
  }

  createIndex.calculateIndexFromDatabase = function (accountId) {
    var thisCutOff = new cutOff()
    if (!db)
      return createIndex.emit('calculate-index-from-database-error', 'No DB connected')

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
