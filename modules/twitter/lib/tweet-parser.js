/*
 * @package charli
 * @subpackage twitter
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 * @author Wouter Vroeee <wouter AT woutervroege DOT nl>
 */

function TweetParser(tweet) {
  var location = parsePublisherLocation(tweet.user.time_zone, tweet.user.location)
  if(!location) return false
  return {
    medium: 'twitter',
    mediumPublicationId: tweet.id,
    publisherLocation: location,
    date: new Date(tweet.created_at),
    weight: getPublicationWeight(tweet)
  }
}

function getPublicationWeight(tweet) {
  var followerCount = tweet.user.followers_count
  return (followerCount / 650000000) * 1000000
}

function parsePublisherLocation(userTimezone, userLocation) {
  if(!userTimezone) userTimezone = ""
  if(!userLocation) userLocation = ""
  if(userTimezone.match(/amsterdam/i) || userLocation.match(/amsterdam/i)) return "Amsterdam"
  if(userTimezone.match(/berlin/i) || userLocation.match(/berlin/i)) return "Berlin"
  if(userTimezone.match(/paris/i) || userLocation.match(/paris/i)) return "Paris"
  return false
}

module.exports = TweetParser