# fear-index

Giving you an index of how fearful everyone is.

# How Charli calculates the index

Charli receives a subset of tweets with the words "terreur", "terrorisme" and "aanslag". The amount of followers of a user that sent the tweet is the weight that a tweet is counted with. The index is total weight of all these tweets in the last 60 minutes.

# Technical

## Web app

URL: `http://localhost:8080/`

A simple web app that tells you the current Threat level in The Netherlands.

## API

URL: `http://localhost:8080/api`

API telling you the Threat level in the Netherlands

# Install & Run

Create a file called `twitter-login-token.js` with the following content and your own keys

```json
{
	"consumer_key": "",
	"consumer_secret": "",
	"access_token": "",
	"access_token_secret": ""
}

```

Set environment variable MONGOLAB_URI!

`npm install` and then `node index.js`
