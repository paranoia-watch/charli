/*
 * @package charli
 * @subpackage twitter
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 */

require('dotenv').config({silent: true})
var tracker = require('./lib/tracker')
var parseTweet = require('./lib/tweet-parser')
var settings = require('../../settings.js').twitterTracker
var events = require('events')

function trackStream(termsArray) {
  if(settings.disabled)
    return shutdown('Twitter tracking is disabled in the settings')

  var streamTracker = new tracker({
      terms: termsArray,
      consumerKey: settings.consumerKey,
      consumerSecret: settings.consumerSecret,
      accessToken: settings.accessToken,
      accessSecret: settings.accessSecret
  })
  return streamTracker
}

function getPublicationStream(searchTerms) {
    var publicationStream = new events.EventEmitter()
    var twitterTrack = trackStream(searchTerms)

    twitterTrack.on('connect', function(statusMessage) {
      publicationStream.emit('connect', statusMessage)
    })

    twitterTrack.on('connection-error', function(error) {
      publicationStream.emit('connection-error', error)
    })

    twitterTrack.on('tweet', function(tweet) {
      var publication = parseTweet(tweet)
      publicationStream.emit('publication', publication)
    })

    return publicationStream
}

function shutdown(message) {
  console.log(message);
  process.exit()
}

exports.publisher = getPublicationStream