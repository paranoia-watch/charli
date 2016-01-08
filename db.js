var settings = require('./settings.js')

var mongoose = require('mongoose')
var events = require('events')

var Db = function () {
  // if (settings.db.disabled) {
  //   return console.info('The database is disabled in the settings')
  // }
  var db = new events.EventEmitter()
  
  mongoose.connect(settings.db.uri, function (err, res) {
    if (err) {
      db.emit('connection-error', err, res)
    } else {
      db.emit('connected')
    }
  })
  
  indexSchema = new mongoose.Schema({
    trigger: String,
    triggerId: String,
    theIndex: Number,
    weight: Number,
    date: Date,
  })

  db.Index = mongoose.model('Index', indexSchema)
  
  return db
}

module.exports = Db
