/*
 * @package charli
 * @subpackage twitter
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 */

var tracker = require('./lib/tracker')
var parseTweet = require('./lib/tweet-parser')
var events = require('events')

function trackStream (twitterSettings, termsArray) {
  if (twitterSettings.disabled)
    return shutdown('Twitter tracking is disabled in the settings')

  var streamTracker = new tracker({
    terms: termsArray,
    consumerKey: twitterSettings.consumerKey,
    consumerSecret: twitterSettings.consumerSecret,
    accessToken: twitterSettings.accessToken,
    accessSecret: twitterSettings.accessSecret
  })
  return streamTracker
}

function getPublicationStream (twitterSettings, searchTerms) {
  var publicationStream = new events.EventEmitter()
  var twitterTrack = trackStream(twitterSettings, searchTerms)

  twitterTrack.on('connect', function (statusMessage) {
    publicationStream.emit('connect', statusMessage)
  })

  twitterTrack.on('connection-error', function (error) {
    publicationStream.emit('connection-error', error)
  })

  twitterTrack.on('tweet', function (tweet) {
    var publication = parseTweet(tweet)
    if (publication) publicationStream.emit('publication', publication)
  })

  return publicationStream
}

function shutdown (message) {
  console.log(message)
  process.exit()
}

exports.publisher = getPublicationStream
