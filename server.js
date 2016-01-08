// Import settings
var settings = require('./settings.js')

var http = require('http')
var express = require('express')
var socketio = require('socket.io')

var events = require('events')

var twitterTracker = require('./twitter-tracker.js')

var Server = function () {
  if (settings.server.disabled) {
    return console.info('The server has been disabled in the settings.')
  }
  var server = new events.EventEmitter()

  server.httpListen = function () {
    console.info('The fear index is listening on port ' + settings.server.port)

    server.app.get('/style.css', function (req, res) {
      res.sendFile('style.css', {
        root: './static'
      })
    })
    server.app.get('/app.js', function (req, res) {
      res.sendFile('app.js', {
        root: './static'
      })
    })
    server.app.get('/jquery.js', function (req, res) {
      res.sendFile('jquery.js', {
        root: './static'
      })
    })
    server.app.get('/bigtext.jquery.js', function (req, res) {
      res.sendFile('bigtext.jquery.js', {
        root: './static'
      })
    })
    server.app.get('/animateNumber.jquery.js', function (req, res) {
      res.sendFile('animateNumber.jquery.js', {
        root: './static'
      })
    })

    server.app.get('/', function (req, res) {
      res.set('Content-Type', 'text/html')
      res.send('<!DOCTYPE html>' + '<html lang="en">' + '<head>' + '<meta charset="UTF-8">' + '<title>paranoia.watch</title>' + '<link rel="stylesheet" href="style.css">' + '<script src="/socket.io/socket.io.js"></script>' + '</head>' + '<body>' + '<div id="bigtext">' + '<div id="display"><span id="index">' + server._index + '</span><span id="degrees">&deg;</span></div>' + '<div id="header">paranoia.watch</div>' + '</div>' + '<script src="jquery.js"></script>' + '<script src="bigtext.jquery.js"></script>' + '<script src="animateNumber.jquery.js"></script>' + '<script src="app.js" charset="utf-8"></script>' + '</body>' + '</html>')
    })

    server.app.get('/api', function (req, res) {
      res.set('Content-Type', 'application/json')
      res.send({
        'charli': degrees.getIndex()
      })
    })

  }

  server.ioListen = function () {
    server.ioServer.sockets.on('connection', function (socket) {
      server.on('index-changed', function (number) {
        server._index = number
        socket.emit('index-changed', {
          'index': number
        })
      })
      server.on('broadcast-info', function (message) {
        socket.emit('info', {
          'info': message
        })
      })
    })
  }
  
  server.changeIndex = function (newIndex) {
    server.emit('index-changed', newIndex)
  }
  
  server.twitterConnected = function (request) {
    if (request.statusMessage !== 'OK') {
      server.emit('broadcast-info', {
        'info': request.statusMessage
      })
    }
  }

  // Start a server
  server.app = express()
  server.httpServer = http.createServer(server.app)
  server.ioServer = socketio(server.httpServer)

  server.httpServer.listen(
    settings.server.port,
    server.httpListen
  )
  server.ioListen()
  
  return server
}

module.exports = Server
