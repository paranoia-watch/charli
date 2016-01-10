/*
 * @package charli
 * @subpackage api
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

require('dotenv').config({silent: true, path: '../../.env'})
global.settings = require('../../settings')
global.dbsettings = settings.db
var backend = require('./' + settings.backend + '/index')
var twitter = require('../../twitter/index')
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
  
  api.processPublications = function () {
    return backend.processPublications()
  }

  return api
}

function processPublications(callback) {
  var publications = new events.EventEmitter()

  var twitterPublications = new twitter.publisher(['plas', 'poep', 'seks', 'kut', 'piemel']);
    twitterPublications.on('publication', function (publication) {
      publications.emit('publication-found', publication)
      backend.savePublication(publication, function(err) {
        publications.emit('publication-added', publication)
      })
    })
  })

  return publications
}

function shutdown (message) {
  console.error(message + ', shutting down')
  process.exit()
}

module.exports = API