var settings = require('./settings.js')

var twitterTracker = new require('./modules/twitter-tracker.js')(settings.twitterTracker)
var db = new require('./modules/db.js')(settings.db)
var createIndex = new require('./modules/create-index.js')(settings.createIndex, db)
var server = new require('./modules/server.js')(settings.server)

if (db) {
  db.on('connection-error', function (err, res) {
    console.error('Database connection error', err, res)
  })
}

if (twitterTracker) {
  twitterTracker.on('tweet', function (tweet) {
    if (createIndex) createIndex.addTweet(tweet)
  })

  twitterTracker.on('limit', function (message) {
    console.error('Twitter limit', message)
  })
  twitterTracker.on('disconnect', function (message) {
    console.error('Twitter disconnect', message)
  })
  twitterTracker.on('connect', function (statusMessage) {
    console.info('Twitter connecting and waiting for a response from Twitter')
  })
  twitterTracker.on('connected', function (statusMessage) {
    console.info('Twitter connected', statusMessage)
  })
  twitterTracker.on('connection-error', function (statusMessage) {
    console.info('Connection error', statusMessage)
  })
  twitterTracker.on('reconnect', function (request, response, connectInterval) {
    console.info('Twitter reconnecting in', connectInterval)
  })
  twitterTracker.on('warning', function (message) {
    console.warn('Twitter warning', message)
  })
}

if (createIndex) {
  createIndex.on('index-changed', function (newIndex) {
    console.log('The index is changed to: ', newIndex)
    if (server) server.emit('broadcast-index', newIndex)
  })

  createIndex.on('tweet-added', function (record, index) {
    console.info('Tweet ', record, 'Index is at ', index)
  })
  createIndex.on('add-tweet-error', function (err, tweet) {
    console.error('Error adding tweet', err, tweet)
  })
  createIndex.on('calculate-index-from-database-error', function (err, result) {
    console.error('Error caluculating Index from the database', err, result)
  })
}
