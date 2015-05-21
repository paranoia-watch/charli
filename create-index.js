var fs = require('fs');

var createIndex = {
	addTweet: function(tweet) {
		var cacheTweet = {
			created_at: new Date(tweet.created_at),
			id: tweet.id,
			weight: createIndex.calculateWeight(tweet)
		}

		return createIndex.cache.push(cacheTweet)
	},
	calculateWeight: function (tweet) {
		weight = parseInt(tweet.user.followers_count)
		return weight
	},
	calculateIndex: function () {
		var index = 0
		var cutOff = new Date() - 60 * 60 * 1000

		for (var i = 0; i < createIndex.cache.length; i++) {
			var record = createIndex.cache[i]
			if (record.created_at < cutOff) {
				createIndex.cache.splice(i, 1)
			}
			index = index + record.weight
		}

		return index
	},
	saveCache: function () {
		fs.writeFile("/tmp/cache.json", JSON.stringify(createIndex.cache), function(err) {
		    if(err) {
		        return console.log(err);
		    }
		    console.log("Saved Cache");
		});
	},
	initialise: function () {
		try { createIndex.cache = require('./tmp/cache.json') }
		catch( e ) { return false }
	},
	cache: [],
	index: 0
}

module.exports = createIndex
