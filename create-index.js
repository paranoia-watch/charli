var fs = require('fs');

var createIndex = {
	addTweet: function(tweet) {
		var cacheTweet = {
			created_at: new Date(tweet.created_at),
			id: tweet.id,
			weight: createIndex.calculateWeight(tweet)
		}

		createIndex.saveCache()
		return createIndex.cache.push(cacheTweet)
	},
	calculateWeight: function (tweet) {
		weight = parseFloat(tweet.user.followers_count) / 1000
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

		return parseFloat(index).toFixed(2)
	},
	saveCache: function () {
		fs.writeFile("./.cache.json", JSON.stringify(createIndex.cache), function(err) {
		    if(err) {
		        return console.log(err);
		    }
		    return console.log("Saved Cache");
		});
	},
	initialise: function () {
		try {
			var readCacheFile = require('./.cache.json')
			console.log(readCacheFile)
			createIndex.cache = readCacheFile
			readCacheFile = undefined
			}
		catch( error ) { return console.log('Cache not loaded', error) }
		return console.log('cache loaded')
	},
	cache: [],
	index: 0
}

module.exports = createIndex
