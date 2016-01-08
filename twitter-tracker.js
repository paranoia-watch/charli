var settings = require('./settings.js')
var Twit = require('twit')
var twitterAuthKeys = {
  'consumer_key': settings.twitter.consumerKey,
  'consumer_secret': settings.twitter.consumerSecret,
  'access_token': settings.twitter.accessToken,
  'access_token_secret': settings.twitter.accessSecret
}
var Twitter = new Twit(twitterAuthKeys)
var createIndex = require('./create-index.js')
var events = require('events')

var TwitterTracker = function () {
  if (settings.twitter.disabled) {
    return console.info('Twitter tracking is disabled in the settings')
  }
  if (!settings.twitter.consumerKey) {
    return console.error('Twitter is not configured with the required consumerKey')
  }
  if (!settings.twitter.consumerSecret) {
    return console.error('Twitter is not configured with the required consumerSecret')
  }
  if (!settings.twitter.accessToken) {
    return console.error('Twitter is not configured with the required accessToken')
  }
  if (!settings.twitter.accessSecret) {
    return console.error('Twitter is not configured with the required accessSecret')
  }
  if (!settings.twitter.track) {
    return console.error('Twitter is not configured with the required tracking parameters')
  }

  var twitterTracker = new events.EventEmitter()

  console.log('Start the Twitter stream and track', settings.twitter.track.nld)
  stream = Twitter.stream('statuses/filter', {
    track: settings.twitter.track.nld
  })
  stream.on('tweet', function (tweet) {
    twitterTracker.emit('tweet', tweet)
  })
  stream.on('limit', function (message) {
    twitterTracker.emit('limit', message)
  })
  stream.on('disconnect', function (message) {
    twitterTracker.emit('disconnect', message)
  })
  stream.on('connect', function (request) {
    twitterTracker.emit('connect', request.statusMessage)
  })
  stream.on('connected', function (request) {
    if (request.statusMessage !== 'OK') {
      return twitterTracker.emit('connection-error', request.statusMessage)
    }
    twitterTracker.emit('connected', request.statusMessage)
  })
  stream.on('reconnect', function (request, response, connectInterval) {
    twitterTracker.emit('reconnect', request, response, connectInterval)
  })
  stream.on('warning', function (message) {
    twitterTracker.emit('warning', message)
  })
    
  return twitterTracker
}

module.exports = TwitterTracker
