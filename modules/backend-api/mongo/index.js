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
var moment = require('moment');

function connect (dbsettings, callback) {
  mongoose.connect(dbsettings.uri, { server: { connectTimeoutMS: 3600000, poolSize: 25 } }, function (error, data) {
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
    model.save(savecb)
  }, function () {
    return callback(null, data)
  })
}

function savePublication (publication, callback) {
  var model = new PublicationModel(publication)
  model.save(callback)
}

function getDifferenceBetweenLastMinuteAndHistoricalMinuteAverage(location, callback) {

  var firstPublication = moment('2016-10-12T10:20:37Z');
  var now = moment.utc().startOf('minute');
  var lastDay = moment(now.format()).subtract(1, 'days');

  var lastMinute = moment(now.format()).subtract(1, 'minutes');
  var hours = lastMinute.format('hh');
  var minutes = lastMinute.format('mm');

  async.parallel([
    
    //last minute
    function (taskCallback) {
      getLocationWeightAverageByLocationWithinTimeFrame(location, lastDay.format(), now.format(), hours, minutes, taskCallback) 
    },

    //historical, first until yesterday
    function (taskCallback) {
      getLocationWeightAverageByLocationWithinTimeFrame(location, firstPublication.format(), lastDay.format(), hours, minutes, taskCallback) 
    }

  ], function(err, result) {
    if(err) return callback(err);

    var todayAverage = (result[0] && result[0].average) ? result[0].average : 0;
    var historicalAverage = (result[1] && result[1].average) ? result[1].average : 0;

    var currentLocationDifferencePercentage = (todayAverage / historicalAverage) * 100;
    return callback(null, currentLocationDifferencePercentage);

  });

}

function getLocationWeightAverageByLocationWithinTimeFrame(location, startTime, endTime, hours, minutes, callback) {

  var startDay = moment(startTime);
  var endDay = moment(endTime);
  var daysBetween = endDay.diff(startDay, "days");

  var query = [
    {
      "$match": {
        "publisherLocation": location,
        "date":{
          "$gte": new Date(startTime),
          "$lte": new Date(endTime)
        }
      }
    },
    {
      "$project": {
        "weight": "$weight",
        "hour": { "$hour": "$date" },
        "minutes": { "$minute": "$date" }
      }
    },
    {
      "$match": {
        "hour": hours,
        "minutes": minutes
      }
    },
    {
      "$group": {
        "_id": "total",
        "total": {
          "$sum": "$weight" 
        }
      }
    },
    {
      "$project": {
        "total": "$total",
        "average": { "$divide": ["$total", daysBetween] }
      }
    }
  ]

  PublicationModel.aggregate(query, function (error, result) {
    if (error) {
      return callback(error)
    }

    callback(null, result[0] || {})
  })
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
      date: locationAggregrationRecord._id,
      average: locationAggregrationRecord.average
    }
  })
}

function getLocationAveragesPerDay (location, startDay, endDay, callback) {
  var query = [
    {
      "$match": {
        "publisherLocation": location,
        "date" : {
          "$gte": new Date(startDay),
          "$lte": new Date(endDay),
         }
      }
    },
    {
      "$project": {
        "weight": "$weight",
        "yearMonthDay": {
          "$dateToString": {
            "format": "%Y-%m-%d",
            "date": "$date"
          }
        }
      }
    },
    {
      "$group": {
        "_id": "$yearMonthDay",
        "average": {
          "$avg": "$weight"
        }
      }
    },
    {
      "$sort": {
        "_id": 1
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
exports.getDifferenceBetweenLastMinuteAndHistoricalMinuteAverage = getDifferenceBetweenLastMinuteAndHistoricalMinuteAverage;