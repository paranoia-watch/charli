/*
 * @package charli
 * @subpackage twitter
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 * @author Wouter Vroeee <wouter AT woutervroege DOT nl>
 */

var Twit = require('twit')
var events = require('events')

var TwitterTracker = function (settings) {
  if (settings.disabled) {
    console.info('Twitter tracking is disabled in the settings')
    return false
  }
  if (!settings.consumerKey) {
    console.error('Twitter is not configured with the required consumerKey')
    return false
  }
  if (!settings.consumerSecret) {
    console.error('Twitter is not configured with the required consumerSecret')
    return false
  }
  if (!settings.accessToken) {
    console.error('Twitter is not configured with the required accessToken')
    return false
  }
  if (!settings.accessSecret) {
    console.error('Twitter is not configured with the required accessSecret')
    return false
  }
  if (!settings.terms) {
    console.error('Twitter is not configured with the required tracking parameters')
    return false
  }

  var twitterAuthKeys = {
    'consumer_key': settings.consumerKey,
    'consumer_secret': settings.consumerSecret,
    'access_token': settings.accessToken,
    'access_token_secret': settings.accessSecret
  }

  var Twitter = new Twit(twitterAuthKeys)
  var twitterTracker = new events.EventEmitter()

  stream = Twitter.stream('statuses/filter', {
    track: settings.terms
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
    if (request.statusMessage !== 'OK')
      return twitterTracker.emit('connection-error', request.statusMessage)
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
