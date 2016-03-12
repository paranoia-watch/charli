var mongoose = require('mongoose')
var schemas = require('../backend-api/mongo/schema')
var PublicationModel = schemas.createPublicationModel()
var sequenceNumber = 0
mongoose.connect('mongodb://paranoia:977KvtG^DXray.W^xaT97a3oFJiVYEJwA@db.paranoia.watch/paranoia', connectionCallback);

function connectionCallback(err) {
  if(err) return console.error(err);
  getSinglePublication(function(err, data) {
    console.info(err, data)
  })
}

function getSinglePublication(callback) {
  PublicationModel.find({collectionAverageAfterInsert: {$ne: true}}).sort({date: 1}).limit(1).exec(function(err, records) {
    if(err || !records || !records[0]) return callback(err || "no records found")
    callback(null, records[0])
  })
}
