var settings = require('./settings.json')

var fs = require('fs')
var events = require("events")

// Start the database
var mongoose = require("mongoose")
var dbUri = process.env.MONGOLAB_URI

mongoose.connect(dbUri, function (err, res) {
	if (err) {
		console.log('ERROR connecting to: ' + dbUri + '. ' + err)
	} else {
		console.log('Successfully connected to the Database')
	}
})

var indexSchema = new mongoose.Schema({
	trigger: String,
	triggerId: String,
	theIndex: Number,
	weight: Number,
	date: Date,
})

var Index = mongoose.model('Index', indexSchema)

var degrees = new events.EventEmitter

degrees.addTweet = function (tweet) {
	var record = new Index({
		trigger: "tweet",
		triggerId: tweet.id,
		date: new Date(tweet.created_at),
		weight: parseFloat(tweet.user.followers_count),
		theIndex: degrees.theIndex
	})

	record.save(function (err) {
		if (err) console.log('Error on save!', err, record)
		degrees.calculateIndexFromDatabase()
	})

	console.log("Tweet: ", record, "Index is at: ", degrees.getIndex())
}

degrees.calculateIndexFromDatabase = function (accountId) {
	var cutOff = new degrees.cutOff()
	return Index.aggregate([{
		$match: {
			date: {
				$gte: cutOff
			}
		}
	}, {
		$group: {
			_id: "$trigger",
			amount: {
				$sum: 1
			},
			weight: {
				$sum: "$weight"
			},
			average: {
				$avg: "$weight"
			}
		}
	}], function (err, result) {
		if (err || !result[0]) {
			console.log('ERROR calculateIndexFromDatabase', err, result)
			return
		}
		console.log(result)
		degrees.setIndex(result[0].weight)
	})
}

degrees.cutOff = function () {
	return new Date(Date.now() - 60 * 60 * 1000)
}

degrees.initialise = function () {
	degrees.calculateIndexFromDatabase()
}

degrees.theIndex = 0

degrees.getIndex = function () {
	return degrees.theIndex
}

degrees.setIndex = function (number) {
	degrees.theIndex = parseFloat( (number / 1000) - 50).toFixed(2)
	degrees.emit("changed", degrees.getIndex())
}

module.exports = degrees
