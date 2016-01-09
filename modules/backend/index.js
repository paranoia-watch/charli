/*
 * @package charli
 * @subpackage backend
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

require('dotenv').config({silent: true, path: '../../.env'})
global.settings = require('../../settings')
global.dbsettings = settings.db

var backend = require('./' + settings.backend + '/index'),
  events = require('events')

function main () {
  var api = new events.EventEmitter()

  if (dbsettings.disabled) return shutdown('The database is disabled in the settings')
  if (!dbsettings.uri) return shutdown('No database URI specified')

  backend.connect(function (error) {
    if (error) return api.emit('connection-error', err, res)
    api.emit('connected')
  })

  api.processPeilingwijzerData = function (callback) { return backend.processPeilingwijzerData(callback) }
  api.getIndexesIndex = function (callback) { return backend.processPeilingwijzerData(callback) }

  return api
}

function shutdown (message) {
  console.error(message + ', shutting down')
  process.exit()
}

module.exports = main

// var test = main()
// test.processPeilingwijzerData(function(data) {
//   console.log("done processPeilingwijzerData", data)
// })
