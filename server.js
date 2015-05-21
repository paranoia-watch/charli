// Import settings
var twitterAuthKeys = require('./twitter-login-token.json')
var settings = require('./settings.json')

// Start a server
var http = require('http')
var express = require('express')
var app = express()
var server = http.createServer(app)
var io = require('socket.io')(server)
var port = process.env.PORT || 8080;

server.listen(
    port, function() {
    console.log('The fear index is running on port ' + port)

    app.get('/', function (req, res) {
        res.sendFile('index.html', {root: './static'});
	})
    app.get('/style.css', function (req, res) {
        res.sendFile('style.css', {root: './static'});
	})
    app.get('/app.js', function (req, res) {
        res.sendFile('app.js', {root: './static'});
	})

	app.get('/web', function (req, res) {
		res.set('Content-Type', 'text/html')
		res.send('Het <a href="https://www.nctv.nl/onderwerpen/tb/dtn/actueeldreigingsniveau/">NCTB Actueel Dreigingsbeeld Terrorisme Nederland</a> is: "Substantieel". De index staat op ' + createIndex.calculateIndex())
	})

	app.get('/api', function (req, res) {
		res.set('Content-Type', 'application/json')
		res.send({ "NCTB DTN":
			{
				"Source": "https://www.nctv.nl/onderwerpen/tb/dtn/actueeldreigingsniveau/",
				"Level": "Substantieel"
			},
            "Index": createIndex.calculateIndex()
		})
	})
})

// Start streaming from Twitter

var Twit = require('twit')
var Twitter = new Twit(twitterAuthKeys)

console.log('Start the Twitter stream and track ', settings.track )
var stream = Twitter.stream('statuses/filter', { track: settings.track })

stream.on('limit', function (message) {
	console.log("Limit: ", message)
})

stream.on('disconnect', function (message) {
	console.log("Disconnect: ", message)
})

stream.on('connect', function (request) {
	console.log("Connecting and waiting for a response from Twitter")
})

stream.on('connected', function (request) {
	console.log("Connected ", request.statusMessage)
})

stream.on('reconnect', function (request, response, connectInterval) {
	console.log("Reconnecting in ", connectInterval)
})

stream.on('warning', function (message) {
	console.log("warning: ", message)
})

// Manage incoming Tweets
var createIndex = require('./create-index.js')
createIndex.initialise()

stream.on('tweet', function(tweet) {
	console.log("Tweet: ", tweet.id)
    createIndex.addTweet(tweet)
    console.log("Index is at: ", createIndex.calculateIndex())
})

// Start Socket.io Server

console.log('Start the Socket.io server ')

io.sockets.on('connection', function (socket) {
  stream.on('tweet', function(tweet) {
    socket.emit('update', { 'index': createIndex.calculateIndex()})
  })
  stream.on('connected', function (request) {
      socket.emit('info', { 'info': request.statusMessage})
  })
})
