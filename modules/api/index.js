/*
 * @package charli
 * @subpackage api
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

global.dbsettings = global.settings.db
var backend = require('./' + settings.backend)
var twitter = require('../twitter')
var events = require('events')

function API () {
  var api = new events.EventEmitter()

  if (dbsettings.disabled)
    return shutdown('The database is disabled in the settings')
  
  if (!dbsettings.uri)
    return shutdown('No database URI specified')

  backend.connect(function (error) {
    if (error) return api.emit('connection-error', err, res)
    api.emit('connected')
  })

  api.processPeilingwijzerData = function (callback) { return backend.processPeilingwijzerData(callback) }
  
  api.processPublications = processPublications

  return api
}

function processPublications() {
  var publications = new events.EventEmitter()

  var twitterPublications = new twitter.publisher(['aanslag', 'vvd', 'schaatsen', 'kramer', 'politiek']);

  twitterPublications.on('connection-error', function (error) {
    console.log("error!", error)
  })

  twitterPublications.on('connect', function () {
    console.log("connection!")
  })

  twitterPublications.on('publication', function (publication) {
    publications.emit('publication', publication)
    backend.savePublication(publication, function(error) {
      if(error) return publications.emit('save-error', error)
      publications.emit('save', publication)
    })
  })

  return publications
}

function shutdown (message) {
  console.error(message + ', shutting down')
  process.exit()
}

module.exports = API