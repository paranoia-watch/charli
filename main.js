/*
 * @package charli
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

var settings = require('./settings.js')
var API = new require('./modules/backend-api/index.js')('mongo', settings.db)

API.on('connected', function () {
  var trackingTerms = settings.getTrackingTermsAsFlatArray()
  console.info('API connected, tracking ' + trackingTerms)
  API.collectPublications(settings, trackingTerms)
})

API.on('connection-error', function (error) {
  console.error('API connection error', error)
})

API.on('publication-collected', function (publication) {
  console.info('API collected a publication', publication, '\n')
})