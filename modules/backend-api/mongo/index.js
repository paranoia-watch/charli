/*
 * @package charli
 * @subpackage api
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris H van Hoytema <boris AT newatoms DOT com>
 * @author Wouter S P Vroege <wouter AT woutervroege DOT nl>
 */

var mongoose = require('mongoose')
var async = require('async')
var schemas = require('./schema')
var peilingwijzer = require('../../peilingwijzer/index')
var PeilingwijzerModel = schemas.createPeilingwijzerModel()
var PublicationModel = schemas.createPublicationModel()

function connect (dbsettings, callback) {
  mongoose.connect(dbsettings.uri, { server: { connectTimeoutMS: 3600000 } }, function (error, data) {
    mongoose.connection.on('disconnected', function () {
      connect(dbsettings, callback)
    })
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

function getTimeframeToTimeframeGrowth (locations, date, timeframeSpan, callback) {
  var numberOfLocations = locations.length
  var growthNumbers = {}

  locations.map(function (location) {
    getTimeframeToTimeframeGrowthByLocation(location, date, timeframeSpan, function (error, growth) {
      if (error) {
        return callback(error)
      }
      growthNumbers[location] = growth
      if (Object.keys(growthNumbers).length == numberOfLocations) {
        return callback(null, growthNumbers)
      }
    })
  })
}

function getTimeframeToTimeframeGrowthByLocation (location, date, timeframeSpan, callback) {
  var latestTimeframeEndDate = date
  var latestTimeframeStartDate = new Date(date.getTime() - timeframeSpan)
  var latestTimeframeResult = null

  var earliestTimeframeEndDate = latestTimeframeStartDate
  var earliestTimeframeStartDate = new Date(latestTimeframeStartDate.getTime() - timeframeSpan)
  var earlistTimeframeResult = null

  getCumulativePublicationsWeightByLocation(location, latestTimeframeStartDate, latestTimeframeEndDate, function (error, weight) {
    if (error) {
      return callback(error)
    }
    latestTimeframeResult = weight
    if (earlistTimeframeResult !== null) {
      return callback(null, latestTimeframeResult / earlistTimeframeResult)
    }
  })

  getCumulativePublicationsWeightByLocation(location, earliestTimeframeStartDate, earliestTimeframeEndDate, function (error, weight) {
    if (error) {
      return callback(error)
    }
    earlistTimeframeResult = weight
    if (latestTimeframeResult !== null) {
      return callback(null, latestTimeframeResult / earlistTimeframeResult)
    }
  })

}

function getHistoricalData (locations, startDay, endDay, callback) {
  var historicalData = {}
  async.mapSeries(locations, function (location, aggregateCB) {
    getLocationAveragesPerDay(location, startDay, endDay, function (error, data) {
      if (error) {
        return callback(error)
      }
      var locationData = parseLocationAggregrationResultToLocationData(data)
      historicalData[location] = locationData
      aggregateCB()
    })
  }, function () {
    callback(null, historicalData)
  })
}

function parseLocationAggregrationResultToLocationData (locationAggregrationResult) {
  return locationAggregrationResult.map(function (locationAggregrationRecord) {
    return {
      date: locationAggregrationRecord._id.date,
      average: locationAggregrationRecord.average
    }
  })
}

function getLocationAveragesPerDay (location, startDay, endDay, callback) {
  var query = [
    {
      '$match': {
        'locationAverageAfterInsert': {
          '$exists': 1
        },
        'publisherLocation': location,
        'date': {
          '$lte': new Date(endDay),
          '$gte': new Date(startDay)
        }
      }
    },
    {
      '$project': {
        'locationAverageAfterInsert': '$locationAverageAfterInsert',
        'yearMonthDay': {
          '$dateToString': {
            'format': '%Y-%m-%d',
            'date': '$date'
          }
        }
      }
    },
    {
      '$group': {
        '_id': {
          'date': '$yearMonthDay'
        },
        'average': {
          '$avg': '$locationAverageAfterInsert'
        }
      }
    },
    {
      '$sort': {
        'date': 1
      }
    }
  ]

  PublicationModel.aggregate(query, function (error, result) {
    if (error) {
      return callback(error)
    }
    callback(null, result)
  })
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
    if (error) {
      return callback(error)
    }
    if (!result[0] || !result[0].weight) {
      return callback(null, 0)
    }
    callback(null, result[0].weight)
  })
}

process.on('SIGTERM', function () {
  mongoose.connection.close(function () {
    process.exit(0)
  })
})

exports.connect = connect
exports.savePublication = savePublication
exports.processPeilingwijzerData = processPeilingwijzerData
exports.getTimeframeToTimeframeGrowth = getTimeframeToTimeframeGrowth
exports.getHistoricalData = getHistoricalData
