# fear-index

Giving you an index of how fearful everyone is.

# How Charli calculates the index

Charli receives a subset of tweets with the words "terreur", "terrorisme" and "aanslag". The amount of followers of a user that sent the tweet is the weight that a tweet is counted with. The index is total weight of all these tweets in the last 60 minutes.

# Technical

## Web app

URL: `http://localhost:8080/`

A simple web app that tells you the current threat level in The Netherlands.

## API

URL: `http://localhost:8080/api`

API telling you the threat level in the Netherlands.

# Install & Run

Rename `twitter-login-token.example.json` to `twitter-login-token.json` and make sure you fill the consumer_key, consumer_secret, access_token and access_token_secret. Visit and create an app on `https://apps.twitter.com/` to obtain the required credentials.

Set environment variable MONGOLAB_URI!

`npm install` and then `node server.js`
