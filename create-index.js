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
		weight = parseInt(1)
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
	cache: []
}
module.exports = createIndex
