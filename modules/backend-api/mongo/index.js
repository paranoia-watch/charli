/*
 * @package charli
 * @subpackage api
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

var mongoose = require('mongoose')
var async = require('async')
var schemas = require('./schema')
var peilingwijzer = require('../../peilingwijzer/index')
var PeilingwijzerModel = schemas.createPeilingwijzerModel()
var PublicationModel = schemas.createPublicationModel()

function connect (dbsettings, callback) {
  mongoose.connect(dbsettings.uri, function (error, data) {
    if (error) return callback(error)
    callback(null, data)
  })
}

function processPeilingwijzerData (callback) {
  peilingwijzer.getData(function (data) {
    savePeilingwijzerData(data, callback)
  })
}

function savePeilingwijzerData (data, callback) {
  async.mapSeries(data, function (item, savecb) {
    var model = new PeilingwijzerModel(item)
    model.save(function (err) {
      return savecb()
    })
  }, function () {
    return callback(data)
  })
}

function savePublication (publication, callback) {
  var model = new PublicationModel(publication)
  model.save(callback)
}

function getCumulativePublicationsWeightByLocation (location, startDate, endDate, callback) {
  PublicationModel.aggregate([{
    $match: {
      date: {
        $gte: startDate,
        $lte: endDate
      },
      publisherLocation: location
    }
  }, {
    $group: {
      _id: '$trigger',
      weight: {
        $sum: '$weight'
      }
    }
  }], function (error, result) {
    if (error) return callback(error)
    if (!result[0] || !result[0].weight) return callback('Unable to calculate cumulative weight')
    callback(null, result[0].weight)
  })
}

function getTimeframeToTimeframeGrowthByLocation (location, date, timeframeSpan, callback) {
  console.log('getTimeframeToTimeframeGrowthByLocation')

  var latestTimeframeEndDate = date
  var latestTimeframeStartDate = new Date(date.getTime() - timeframeSpan)
  var latestTimeframeResult = 0

  var earliestTimeframeEndDate = latestTimeframeStartDate
  var earliestTimeframeStartDate = new Date(latestTimeframeStartDate.getTime() - timeframeSpan)
  var earlistTimeframeResult = 0

  getCumulativePublicationsWeightByLocation(location, latestTimeframeStartDate, latestTimeframeEndDate, function (error, weight) {
    if (error) return callback(error)
    latestTimeframeResult = weight
    if (earlistTimeframeResult) return callback(null, latestTimeframeResult / earlistTimeframeResult)
  })

  getCumulativePublicationsWeightByLocation(location, earliestTimeframeStartDate, earliestTimeframeEndDate, function (error, weight) {
    if (error) return callback(error)
    earlistTimeframeResult = weight
    if (latestTimeframeResult) return callback(null, latestTimeframeResult / earlistTimeframeResult)
  })

}

exports.connect = connect
exports.savePublication = savePublication
exports.processPeilingwijzerData = processPeilingwijzerData
exports.getTimeframeToTimeframeGrowthByLocation = getTimeframeToTimeframeGrowthByLocation
