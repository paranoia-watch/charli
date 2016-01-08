require('dotenv').load()

var twitterTracker = new require('./twitter-tracker.js')()
var db = new require('./db.js')()
var createIndex = new require('./create-index.js')(db)
var server = new require('./server.js')(createIndex)

// Manage incoming Tweets
twitterTracker.on('tweet', function (tweet) {
  createIndex.addTweet(tweet)
})

createIndex.on('index-changed', function (newIndex) {
  console.log('The index is changed to: ', newIndex)
  server.changeIndex(newIndex)
})

// Logging the current status
db.on('connection-error', function(err, res) {
  console.error('Database connection error', err, res)
})

twitterTracker.on('limit', function(message) {
  console.error('Twitter limit: ', message)
})
twitterTracker.on('disconnect', function (message) {
  console.error('Twitter disconnect: ', message)
})
twitterTracker.on('connect', function (request) {
  console.info('Twitter connecting and waiting for a response from Twitter')
  server.twitterConnected(request)
})
twitterTracker.on('connected', function (request) {
  console.info('Twitter connected ', request.statusMessage)
})
twitterTracker.on('reconnect', function (request, response, connectInterval) {
  console.info('Twitter reconnecting in ', connectInterval)
})
twitterTracker.on('warning', function (message) {
  console.warn('Twitter warning: ', message)
})

createIndex.on('tweet-added', function (record, index) {
  return console.info('Tweet: ', record, 'Index is at: ', index)
})
createIndex.on('add-tweet-error', function (err, tweet) {
  console.error('Error adding tweet', err, tweet)
})
createIndex.on('calculate-index-from-database-error', function (err, result) {
  console.error('Error caluculating Index from the database', err, result)
})
