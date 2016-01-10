require('dotenv').config({silent: true})

var settings = {}

settings.backend = process.env.BACKEND || 'mongo'

// Process
settings.server = {
  port: process.env.SERVERPORT || 8080,
  disabled: process.env.SERVERDISABLED || false
}

// Database
settings.db = {
  writeEnabled: process.env.DBWRITEENABLED || false,
  uri: process.env.DBURI,
  disabled: process.env.DBDISABLED || false,
  uri: process.env.DBURI
}

// Streams
settings.twitter = {
  consumerKey: process.env.TWITTERCONSUMERKEY,
  consumerSecret: process.env.TWITTERCONSUMERSECRET,
  accessToken: process.env.TWITTERACCESSTOKEN,
  accessSecret: process.env.TWITTERACCESSSECRET,
  disabled: process.env.TWITTERDISABLED || false
}

settings.trackingTerms = process.env.TWITTERTRACKTERMSJSON || require('./track-twitter-terms.json')
settings.getTrackingTermsAsFlatArray = function() {
  var array = [];
  var keys = Object.keys(settings.trackingTerms);
  return keys.map(function(key) {
    var cityTerms = settings.trackingTerms[key]
    array = array.concat(cityTerms)
    return array
  })
}

// Index
settings.createIndex = {
  disabled: process.env.INDEXDISABLED || false,
  timeSpanToCalculateOver: process.env.INDEXTIMESPAN || 1 * 60 * 60 * 10,
}

module.exports = settings
