var settings = require('./settings.json')

var fs = require('fs');

// Start the database
var mongoose = require("mongoose")
var dbUri = process.env.MONGOLAB_URI || 'mongodb://heroku_app37075198:mijtsru4mj43tlsl7hsmk0ij1l@ds037252.mongolab.com:37252/heroku_app37075198'

mongoose.connect(dbUri, function (err, res) {
	if (err) {
		console.log('ERROR connecting to: ' + dbUri + '. ' + err);
	} else {
		console.log('Succeeded connected to: ' + dbUri);
	}
});

var indexSchema = new mongoose.Schema({
	trigger: String,
	triggerId: String,
	index: Number,
	weight: Number,
	date: Date,
});

var Index = mongoose.model('Index', indexSchema);

var createIndex = {
	addTweet: function(tweet) {
		var index = createIndex.calculateIndex() + parseFloat(tweet.user.followers_count)

		var record = new Index ({
			trigger: "tweet",
			triggerId: tweet.id,
			date: new Date(tweet.created_at),
			weight: parseFloat(tweet.user.followers_count),
			index: index
		})

		record.save(function (err) {if (err) console.log ('Error on save!', record)});
		createIndex.cache.push(record)

		console.log("Tweet: ", record, "Index is at: ", createIndex.getIndex(), " The cache length is:", createIndex.cache.length)
	},
	calculateIndex: function () {
		var index = 0
		var cutOff = new Date() - settings.indexTimeSpan

		for (var i = 0; i < createIndex.cache.length; i++) {
			var record = createIndex.cache[i]
			if (record.date < cutOff || record.date.$date < cutOff) {
				createIndex.cache.splice(i, 1)
			}
			index = index + record.weight
		}

		return parseFloat(index)
	},
	initialise: function () {
		var cutoff = new Date();
		cutoff.setDate(cutoff.getDate()-settings.indexTimeSpan);
		Index.find({date: {$gte: cutoff}}, function (err, docs) {
			if(err) {console.log(err)}
			createIndex.cache = docs
			console.log('the loaded cache length is: ', docs.length)
			createIndex.index = createIndex.calculateIndex()
			return console.log('the index is at: ', createIndex.getIndex())
		 });
	},
	cache: [],
	index: 0,
	getIndex: function () {
		return parseFloat(createIndex.index / 1000).toFixed(2)
	}
}

module.exports = createIndex
