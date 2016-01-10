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

API.on('connected', function (error) {
  console.log('API connected to backend!')

  var publicationProcessor = API.processPublications(settings)

  publicationProcessor.on('publication', function (publication) {
    console.log('\na publication was added!')
  })

  publicationProcessor.on('save', function (publication) {
    console.log('\na publication was saved!', publication)
  })

  publicationProcessor.on('save-error', function (error) {
    console.log("\na publication couldn't be saved!", error)
  })

})
