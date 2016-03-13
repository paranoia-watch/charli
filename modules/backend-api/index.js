/*
 * @package charli
 * @subpackage api
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

var twitter = require('../twitter')
var events = require('events')
var moment = require('moment')

function BackendAPI (backend, dbsettings) {
  var api = new events.EventEmitter()
  var backend = require('./' + backend)

  if (dbsettings.disabled) {
    return shutdown('The database is disabled in the settings')
  }

  if (!dbsettings.uri) {
    return shutdown('No database URI specified')
  }

  backend.connect(dbsettings, function (error) {
    if (error) {
      return api.emit('backend-connection-error', error)
    }
    api.emit('backend-connected')
  })

  api.processPeilingwijzerData = function (callback) { return backend.processPeilingwijzerData(callback) }

  api.collectPublications = function (settings, trackingTerms) {
    return collectPublications(api, settings, trackingTerms)
  }

  api.savePublication = function (publication) {
    backend.savePublication(publication, function (error) {
      if (error) {
        return api.emit('publication-save-error', error)
      }
      api.emit('publication-saved')
    })
  }

  api.updateGrowthNumbers = function (locations, startDate, timeframeSpan) {
    backend.getTimeframeToTimeframeGrowth(locations, startDate, timeframeSpan, function (error, growthNumbers) {
      if (error) {
        return api.emit('paranoia-update-error', error)
      }
      api.emit('paranoia-updated', growthNumbers)
    })
  }

  api.getHistoricalData = function (locations, months, endDayString) {
    var endDay = (endDayString) ? moment(endDayString).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
    var startDay = moment(endDay).subtract(months, 'months').format('YYYY-MM-DD')
    backend.getHistoricalData(locations, startDay, endDay, function (error, historicalData) {
      if (error) {
        return api.emit('historical-data-update-error', error)
      }
      api.emit('historical-data-updated', historicalData)
    })
  }

  return api
}

function collectPublications (api, settings, trackingTerms) {
  collectTwitterPublications(api, settings.twitter, trackingTerms)
}

function collectTwitterPublications (api, twitterSettings, trackingTerms) {
  var mediumName = 'twitter'
  var twitterPublications = new twitter.publisher(twitterSettings, trackingTerms)
  twitterPublications.on('connection-error', function (error) {
    api.emit('collection-connection-error', {
      medium: mediumName,
      error: error
    })
  })
  twitterPublications.on('connect', function () {
    api.emit('collection-connected', mediumName)
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
