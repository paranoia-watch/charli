/*
 * @package charli
 * @subpackage twitter
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Wouter Vroeee <wouter AT woutervroege DOT nl>
 */

var twitter = require('../')
var twitterPublisher = twitter.publisher

var terms = ['aanslag', 'buitenhof', 'russen', 'voetbal']
console.log('Start the Twitter stream and track', terms)

var publisher = new twitterPublisher(terms)

publisher.on('publication', function (tweet) {
  console.log(tweet)
})

publisher.on('connect', function () {
  console.log('connected!')
})

publisher.on('connection-error', function (error) {
  console.error(error)
})
