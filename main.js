/*
 * @package charli
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

var settings = require('./settings.js')
var API = new require('./modules/backend-api/index.js')('mongo', settings.db)

API.on('backend-connected', function () {
  var trackingTerms = settings.getTrackingTermsAsFlatArray()
  console.info('API backend connected, you can now read from and write to it :)')
  API.collectPublications(settings, trackingTerms)

  getParisIndex(function (error, growth) {
    if (error) return console.error(error)
    console.info('Paris growth = ', growth)
  })
})

API.on('backend-connection-error', function (error) {
  console.error('API backend connection error', error)
})

API.on('collection-connected', function (medium) {
  console.info('API connected to collection ' + medium)
})

API.on('collection-connection-error', function (feedback) {
  console.error('API collection connection error for medium ' + feedback.medium + '\ncollection connection says: ' + feedback.error + '\n')
})

API.on('publication-collected', function (publication) {
  console.info('API collected a publication', publication, '\n')
  API.savePublication(publication)
})

API.on('publication-saved', function () {
  console.info('API saved a publication\n')
  getParisIndex(function (error, growth) {
    if (error) return console.error(error)
    console.info('Paris growth = ', growth)
  })
})

API.on('publication-save-error', function (error) {
  console.error('API failed to save a publication\nbackend says: ' + error + '\n')
})

function getParisIndex (callback) {
  API.getTimeframeToTimeframeGrowthByLocation('Paris', new Date(), 1000 * 60 * 60, callback)
}
