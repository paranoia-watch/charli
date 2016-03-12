var mongoose = require('mongoose')
var schemas = require('../backend-api/mongo/schema')
var PublicationModel = schemas.createPublicationModel()
mongoose.connect('mongodb://paranoia:977KvtG^DXray.W^xaT97a3oFJiVYEJwA@db.paranoia.watch/paranoia', connectionCallback);

function connectionCallback(err) {
  if(err) return console.error(err);
  getSinglePublication(function(err, newRecord) {
    var weightOfNewRecord = newRecord.weight
    getCurrentAverageForPreviousPublication(function (err, currentAverageForPreviousPublication) {
      getNumberOfRecordsWithCollectionAverageAfterInsert(function (err, numberOfRecordsWithCollectionAverageAfterInsert) {
        var newCurrentAverageAfterInsert = calculateNewCurrentAverageAfterInsert(currentAverageForPreviousPublication, numberOfRecordsWithCollectionAverageAfterInsert, weightOfNewRecord)
        console.log(newCurrentAverageAfterInsert)
      })
    })
  })
}

function getSinglePublication(callback) {
  PublicationModel.find({collectionAverageAfterInsert: {$exists: false}}).sort({date: 1}).limit(1).exec(function(err, records) {
    if(err || !records || !records[0]) return callback(err || "no records found")
    callback(null, records[0])
  })
}

function getCurrentAverageForPreviousPublication(callback) {
  PublicationModel.find({collectionAverageAfterInsert: {$exists: true}}).sort({date: -1}).limit(1).exec(function(err, records) {
    if(err) return callback(err)
    if(!records || !records[0]) return callback(null, 0)
    callback(null, records[0].collectionAverageAfterInsert)
  })
}

function getNumberOfRecordsWithCollectionAverageAfterInsert(callback) {
 PublicationModel.find({collectionAverageAfterInsert: {$exists: true}}).limit(-1).count(function(err, numberOfRecords) {
   callback(err, numberOfRecords || 0)
 })
}

function calculateNewCurrentAverageAfterInsert(currentAverageForPreviousPublication, numberOfRecordsWithCollectionAverageAfterInsert, weightOfNewRecord) {
  var currentTotalWeight = (currentAverageForPreviousPublication * numberOfRecordsWithCollectionAverageAfterInsert)
  var newTotalWeight = currentTotalWeight + weightOfNewRecord
  var newTotalRecords = numberOfRecordsWithCollectionAverageAfterInsert + 1

  var newCurrentAverageAfterInsert = newTotalWeight / newTotalRecords
  
  return newCurrentAverageAfterInsert
}
