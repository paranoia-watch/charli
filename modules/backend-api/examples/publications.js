/*
 * @package charli
 * @subpackage api
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

var settings = require('../../../settings.js')
var API = new require('../')('mongo', settings.db)

API.on('connection-error', function (error) {
  console.log('API connection error', error)
})

API.on('connected', function () {
  API.collectPublications(settings, ['Boris', 'Mark-Jan', 'Thomas', 'Wouter', 'Google'])
})

API.on('publication-collected', function (publication) {
  console.log('\na publication was collected!', publication)
  API.savePublication(publication)
})

API.on('publication-saved', function () {
  console.log('\na publication was saved!')
})

API.on('publication-save-error', function (error) {
  console.log("\na publication couldn't be saved!", error)
})
