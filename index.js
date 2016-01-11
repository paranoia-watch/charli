/*
 * @package charli
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

var settings = require('./settings.js')
var API = new require('./modules/backend-api/index.js')('mongo', settings.db)
var broadcaster = new require('./modules/broadcaster.js')(settings.server)

var CACHE = {}

setInterval(function () {
  var object = CACHE
  broadcaster.broadcast('paranoia-updated', object)
}, 1000)

broadcaster.on('listening', function (port) {
  console.info('Broadcaster is listening on port', port)
})

broadcaster.on('client-connected', function () {
  console.info('Broadcaster was connected to by some client')
})

API.on('backend-connected', function () {
  var trackingTerms = settings.getTrackingTermsAsFlatArray()
  console.info('API backend connected, you can now read from and write to it :)')
  getGrowthNumbers()
  API.collectPublications(settings, trackingTerms)
})

API.on('backend-connection-error', function (error) {
  console.error('API backend connection error', error)
})

API.on('collection-connected', function (medium) {
  console.info('API connected to collection ' + medium)
})

API.on('collection-connection-error', function (feedback) {
  console.error('API collection connection error for medium ' + feedback.medium + '; collection connection says: ' + feedback.error + '\n')
})

API.on('publication-collected', function (publication) {
  console.info('API collected a publication', publication, '\n')
  API.savePublication(publication)
})

API.on('publication-saved', function () {
  console.info('API saved a publication\n')
  getGrowthNumbers()
})

API.on('publication-save-error', function (error) {
  console.error('API failed to save a publication\nbackend says: ' + error + '\n')
})

API.on('paranoia-updated', function (growthNumbers) {
  var object = parseGrowthNumbersToClientReadibleObject(growthNumbers)
  console.info('broadcasting paranoia', object)
  CACHE = object
  broadcaster.broadcast('paranoia-updated', object)
})

API.on('paranoia-update-error', function (error) {
  console.error('API failed to update paranoia\nbackend says: ' + error + '\n')
})

function getGrowthNumbers () {
  API.updateGrowthNumbers(['Amsterdam', 'Paris', 'Berlin'], new Date(), getCurrentTimeframeSpan())
}

function parseGrowthNumbersToClientReadibleObject (growthNumbers) {
  var object = {paranoiaChange: []}
  object.paranoiaChange.push({
    interval: getCurrentTimeframeSpan(),
    locations: parseLocationDataFromGrowthNumbers(growthNumbers)
  })
  return object
}

function parseLocationDataFromGrowthNumbers (growthNumbers) {
  var locationNames = Object.keys(growthNumbers)
  return locationNames.map(function (locationName) {
    return {
      name: locationName,
      change: parseFractionToGrowthPercentage(growthNumbers[locationName])
    }
  })
}

function parseFractionToGrowthPercentage(fraction) {
  return ((fraction * 100) - 100).toFixed(2)
}

function getCurrentTimeframeSpan () {
  return 1000 * 60 * 60
}
