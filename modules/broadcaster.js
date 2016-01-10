/*
 * @package charli
 * @subpackage broadcaster
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

var http = require('http')
var socketio = require('socket.io')
var events = require('events')

var Broadcaster = function (settings) {
  var broadcaster = new events.EventEmitter()
  var httpServer = http.createServer()
  var socketServer = socketio(httpServer)

  if (settings.disabled) {
    return broadcaster.emit('disabled')
  }

  var listenToHttp = function () {
    broadcaster.emit('listening', settings.port)
  }

  var listenToSockets = function () {
    socketServer.sockets.on('connection', function (socket) {
      broadcaster.emit('client-connected')
    })
  }

  // Start a broadcaster
  httpServer.listen(settings.port, listenToHttp)
  listenToSockets()

  return broadcaster
}

module.exports = Broadcaster
