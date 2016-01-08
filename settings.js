var settings = {}

// Process
settings.server = {
  port: process.env.SERVERPORT || 8080,
  disabled: process.env.SERVERDISABLED || false
}

// Database
settings.db = {
  writeEnabled: process.env.DBWRITEENABLED || false,
  uri: process.env.DBURI
}

// Streams
settings.twitter = {
    consumerKey: process.env.TWITTERCONSUMERKEY,
    consumerSecret: process.env.TWITTERCONSUMERSECRET,
    accessToken: process.env.TWITTERACCESSTOKEN,
    accessSecret: process.env.TWITTERACCESSSECRET,
    track: process.env.TWITTERTRACKTERMSJSON || require('./track-twitter-terms.json'),
    disabled: process.env.TWITTERDISABLED || false
  }

// Index
settings.index = {
  disabled: process.env.INDEXDISABLED || false,
  timeSpanToCalculateOver: process.env.INDEXTIMESPAN || 1*60*60*10,
}

module.exports = settings
