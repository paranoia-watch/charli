var mongoose = require('mongoose')
var events = require('events')

var Db = function (settings) {
  if (settings.disabled) {
    console.info('The database is disabled in the settings')
    return false
  }
  if (!settings.uri) {
    console.error('No database URI specified')
    return false
  }
  var db = new events.EventEmitter()
  db.settings = settings
  
  mongoose.connect(settings.uri, function (err, res) {
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
