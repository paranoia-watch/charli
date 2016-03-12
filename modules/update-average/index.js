var mongoose = require('mongoose')
var schemas = require('../backend-api/mongo/schema')
var PublicationModel = schemas.createPublicationModel()
var numberOfRecordsWithCollectionAverageAfterInsert = null
var collectionAverageForPreviousPublication = null
var searchForLocation = false
var weightOfNewRecord = null
var newRecord = null
var databaseField = (searchForLocation) ? "locationAverageAfterInsert" : "collectionAverageAfterInsert"
mongoose.connect('mongodb://paranoia:977KvtG^DXray.W^xaT97a3oFJiVYEJwA@db.paranoia.watch/paranoia', updateAverage);

function updateAverage(err) {
  if(err) return console.error(err);
  getSinglePublication(singlePublicationFound)
}

function singlePublicationFound(err, publication) {
  newRecord = publication
  weightOfNewRecord = newRecord.weight
  getCollectionAverageForPreviousPublication(collectionAverageForPreviousPublicationFound)
}

function collectionAverageForPreviousPublicationFound(err, collectionAverageForPreviousPublication) {
  getNumberOfRecordsWithCollectionAverageAfterInsert(numberOfRecordsWithCollectionAverageAfterInsertFound)
}

function numberOfRecordsWithCollectionAverageAfterInsertFound(err, numberOfRecordsWithCollectionAverageAfterInsert) {
  var newCollectionAverageAfterInsert = calculateNewCollectionAverageAfterInsert(collectionAverageForPreviousPublication, numberOfRecordsWithCollectionAverageAfterInsert, weightOfNewRecord)
  addCollectionAverageAfterInsertToPublication(newRecord, newCollectionAverageAfterInsert, publicationUpdated)
}

function publicationUpdated(err, data) {
  if(err) console.error(err)
  //console.log('Records:', numberOfRecordsWithCollectionAverageAfterInsert, 'Data:', data)
  updateAverage(null)
}

function getSinglePublication(callback) {
  var query = {};
  query[databaseField] = {$exists: false}
  if(searchForLocation) query.publisherLocation = searchForLocation
  PublicationModel.find(query).sort({date: 1}).limit(1).exec(function(err, records) {
    if(err || !records || !records[0]) return callback(err || "no records found")
    callback(null, records[0])
  })
}

function getCollectionAverageForPreviousPublication(callback) {
  if(collectionAverageForPreviousPublication !== null) {
    return callback(null, collectionAverageForPreviousPublication)
  }

  var query = {};
  query[databaseField] = {$exists: true}

  PublicationModel.find(query).sort({date: -1}).limit(1).exec(function(err, records) {
    if(err) return callback(err)
    if(!records || !records[0]) return callback(null, 0)
    callback(null, records[0][databaseField])
  })
}

function getNumberOfRecordsWithCollectionAverageAfterInsert(callback) {
  if(numberOfRecordsWithCollectionAverageAfterInsert !== null) {
    return callback(null, numberOfRecordsWithCollectionAverageAfterInsert)
  }

  var query = {};
  query[databaseField] = {$exists: true}

  PublicationModel.find(query).count(function(err, numberOfRecords) {
    numberOfRecordsWithCollectionAverageAfterInsert = numberOfRecords || 0
    callback(err, numberOfRecordsWithCollectionAverageAfterInsert)
  })
}

function calculateNewCollectionAverageAfterInsert(collectionAverageForPreviousPublication, numberOfRecordsWithCollectionAverageAfterInsert, weightOfNewRecord) {
  var currentTotalWeight = (collectionAverageForPreviousPublication * numberOfRecordsWithCollectionAverageAfterInsert)
  var newTotalWeight = currentTotalWeight + weightOfNewRecord
  var newTotalRecords = numberOfRecordsWithCollectionAverageAfterInsert + 1

  var newCollectionAverageAfterInsert = newTotalWeight / newTotalRecords
  console.log(collectionAverageForPreviousPublication, numberOfRecordsWithCollectionAverageAfterInsert, weightOfNewRecord)
  return newCollectionAverageAfterInsert
}

function addCollectionAverageAfterInsertToPublication (publication, collectionAverageAfterInsert, callback) {
  numberOfRecordsWithCollectionAverageAfterInsert = numberOfRecordsWithCollectionAverageAfterInsert + 1
  collectionAverageForPreviousPublication = collectionAverageAfterInsert

  publication[databaseField] = collectionAverageAfterInsert
  console.log(publication)
  publication.save(callback)
}
