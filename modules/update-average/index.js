var mongoose = require('mongoose')
var schemas = require('../backend-api/mongo/schema')
var PublicationModel = schemas.createPublicationModel()
var numberOfRecordsWithCollectionAverageAfterInsert = null
var collectionAverageForPreviousPublication = null
mongoose.connect('mongodb://paranoia:977KvtG^DXray.W^xaT97a3oFJiVYEJwA@db.paranoia.watch/paranoia', updateAverage);

function updateAverage(err) {
  if(err) return console.error(err);
  getSinglePublication(function(err, newRecord) {
    var weightOfNewRecord = newRecord.weight
    getCollectionAverageForPreviousPublication(function (err, collectionAverageForPreviousPublication) {
      getNumberOfRecordsWithCollectionAverageAfterInsert(function (err, numberOfRecordsWithCollectionAverageAfterInsert) {
        var newCollectionAverageAfterInsert = calculateNewCollectionAverageAfterInsert(collectionAverageForPreviousPublication, numberOfRecordsWithCollectionAverageAfterInsert, weightOfNewRecord)
        
        addCollectionAverageAfterInsertToPublication(newRecord, newCollectionAverageAfterInsert, function (err, data) {
          if(err) console.error(err)
          console.log('Records:', numberOfRecordsWithCollectionAverageAfterInsert, 'Average:', data.collectionAverageAfterInsert)
          updateAverage(null)
        })
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

function getCollectionAverageForPreviousPublication(callback) {
  if(collectionAverageForPreviousPublication !== null) {
    return callback(null, collectionAverageForPreviousPublication)
  }
  PublicationModel.find({collectionAverageAfterInsert: {$exists: true}}).sort({date: -1}).limit(1).exec(function(err, records) {
    if(err) return callback(err)
    if(!records || !records[0]) return callback(null, 0)
    callback(null, records[0].collectionAverageAfterInsert)
  })
}

function getNumberOfRecordsWithCollectionAverageAfterInsert(callback) {
  if(numberOfRecordsWithCollectionAverageAfterInsert !== null) {
    return callback(null, numberOfRecordsWithCollectionAverageAfterInsert)
  }
  PublicationModel.find({collectionAverageAfterInsert: {$exists: true}}).count(function(err, numberOfRecords) {
    numberOfRecordsWithCollectionAverageAfterInsert = numberOfRecords || 0
    callback(err, numberOfRecordsWithCollectionAverageAfterInsert)
  })
}

function calculateNewCollectionAverageAfterInsert(collectionAverageForPreviousPublication, numberOfRecordsWithCollectionAverageAfterInsert, weightOfNewRecord) {
  var currentTotalWeight = (collectionAverageForPreviousPublication * numberOfRecordsWithCollectionAverageAfterInsert)
  var newTotalWeight = currentTotalWeight + weightOfNewRecord
  var newTotalRecords = numberOfRecordsWithCollectionAverageAfterInsert + 1

  var newCollectionAverageAfterInsert = newTotalWeight / newTotalRecords
  
  return newCollectionAverageAfterInsert
}

function addCollectionAverageAfterInsertToPublication (publication, collectionAverageAfterInsert, callback) {
  numberOfRecordsWithCollectionAverageAfterInsert = numberOfRecordsWithCollectionAverageAfterInsert + 1
  collectionAverageForPreviousPublication = collectionAverageAfterInsert

  publication.collectionAverageAfterInsert = collectionAverageAfterInsert
  publication.save(callback)
}
