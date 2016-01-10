/*
 * @package charli
 * @subpackage api
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

var twitter = require('../twitter')
var events = require('events')

function BackendAPI (backend, dbsettings) {
  var api = new events.EventEmitter()
  var backend = require('./' + backend)

  if (dbsettings.disabled)
    return shutdown('The database is disabled in the settings')

  if (!dbsettings.uri)
    return shutdown('No database URI specified')

  backend.connect(dbsettings, function (error) {
    if (error) return api.emit('connection-error', err, res)
    api.emit('connected')
  })

  api.processPeilingwijzerData = function (callback) { return backend.processPeilingwijzerData(callback) }

  api.collectPublications = function (settings) {
    return collectPublications(api, settings)
  }

  api.savePublication = function (publication) {
    backend.savePublication(publication, function (error) {
      if (error)
        return api.emit('publication-save-error', error)
      api.emit('publication-saved')
    })
  }

  return api
}

function collectPublications (api, settings) {
  collectTwitterPublications(api, settings.twitter)
}

function collectTwitterPublications (api, twitterSettings) {
  var twitterPublications = new twitter.publisher(twitterSettings, ['aanslag', 'vvd', 'schaatsen', 'kramer', 'politiek']) // todo
  twitterPublications.on('connection-error', function (error) {
    api.emit('collection-connection-error', error)
  })
  twitterPublications.on('connect', function () {
    api.emit('collection-connection', 'twitter')
  })
  twitterPublications.on('publication', function (publication) {
    api.emit('publication-collected', publication)
  })
}

function shutdown (message) {
  console.error(message + ', shutting down')
  process.exit()
}

module.exports = BackendAPI
