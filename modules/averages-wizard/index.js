var async = require("async")
var mongoose = require('mongoose')
var schemas = require('../backend-api/mongo/schema')
var PublicationModel = schemas.createPublicationModel()

function getPublicationAverages(publication, callback) {
    
    var locationAverages = {}
    var locationNumbers = {}
    var collectionAverage = null
    var collectionNumber = null
    
    async.parallel([
        function(taskCallback) {
            getCurrentCollectionAverage(publication.date, publication.weight, function(error, currentCollectionAverage) {
                if(error) return callback(error)
                collectionAverage = currentCollectionAverage
                taskCallback()
            })
        },
        function(taskCallback) {
            getCurrentcollectionNumber(publication.date, function(error, count) {
                if(error) return callback(error)
                collectionNumber = count
                taskCallback()
            })
        },
        function(taskCallback) {
            getCurrentLocationAverage(publication.date, publication.weight, publication.publisherLocation, function(error, currentLocationAverage) {
                if(error) return callback(error)
                locationAverages[publication.publisherLocation] = currentLocationAverage
                taskCallback()
            })
        },
        function(taskCallback) {
            getCurrentNumberOfLocationPublications(publication.date, publication.publisherLocation, function(error, count) {
                if(error) return callback(error)
                locationNumbers[publication.publisherLocation] = count
                taskCallback()
            })
        },
    ], function() {
        var newCollectionAverage = calculateNewAverage(collectionAverage, collectionNumber, publication.weight);
        var newLocationAverage = calculateNewAverage(locationAverages[publication.publisherLocation], locationNumbers[publication.publisherLocation], publication.weight);
        callback(null, {
            collectionAverage: newCollectionAverage,
            locationAverage: newLocationAverage
        });
    })
}

function index() {
    async.forever(
        function(next) {
            indexRecord(next)
        },
        function(error) {
            console.log("error while indexing, shutting down", error)
            process.exit();
        }
    )
}

function indexRecord(callback) {
    async.waterfall([
        function(taskCallback) {
            getOldestUnindexedPublication(taskCallback)
        },
        function(publication, taskCallback) {
            getPublicationAverages(publication, function(err, data) {
                publication.collectionAverageAfterInsert = data.collectionAverage
                publication.locationAverageAfterInsert = data.locationAverage
                taskCallback(null, publication);
            })
        },
        function(publication, taskCallback) {
            savePublication(publication, taskCallback)
        }
    ], function(error, result) {
        console.log("\ndate: " + result.date, "\nlocation: " + result.publisherLocation, "\nweight: " + result.weight, "\ncollectionAverageAfterInsert: " + result.collectionAverageAfterInsert, "\nlocationAverageAfterInsert: " + result.locationAverageAfterInsert)
        callback(error);
    })
}

function getOldestUnindexedPublication(callback) {
    PublicationModel
        .find({
            collectionAverageAfterInsert: {
                "$exists": false
            },
            locationAverageAfterInsert: {
                "$exists": false
            }
        })
        .sort({
            date: 1
        })
        .limit(1)
        .exec(function(error, results) {
            if(error) return callback(error)
            if(!results || !results[0]) return callback("no records found")
            callback(null, results[0])
        })
}

function savePublication(publication, callback) {
    publication.save(callback);
}

function calculateNewAverage(oldAverage, numberOfRecords, addedValue) {
    var oldCumulativeWeight = oldAverage * numberOfRecords
    var newCumulativeWeight = oldCumulativeWeight + addedValue
    var newCollectionAverage = newCumulativeWeight / (numberOfRecords+1)
    return newCollectionAverage
}

function getCurrentcollectionNumber(dateOfNewRecord, callback) {
    PublicationModel
        .find({
            date: {
                "$lt": new Date(dateOfNewRecord),
            }
        })
        .count()
        .exec(callback)
}

function getCurrentCollectionAverage(dateOfNewRecord, publicationWeight, callback) {
    PublicationModel
        .find({
            date: {
                "$lt": new Date(dateOfNewRecord),
            }
        })
        .sort({
            date: -1
        })
        .limit(1)
        .exec(function(error, results) {
            if(error) return callback(error)
            if(!results || !results[0]) return callback("no records found")
            callback(null, results[0].collectionAverageAfterInsert || publicationWeight)
        })
}

function getCurrentLocationAverage(dateOfNewRecord, publicationWeight, locationName, callback) {
    PublicationModel
        .find({
            date: {
                "$lt": new Date(dateOfNewRecord),
            },
            publisherLocation: locationName
        })
        .sort({
            date: -1
        })
        .limit(1)
        .exec(function(error, results) {
            if(error) return callback(error)
            if(!results || !results[0]) return callback("no records found")
            callback(null, results[0].locationAverageAfterInsert || publicationWeight)
        })
}

function getCurrentNumberOfLocationPublications(dateOfNewRecord, locationName, callback) {
    PublicationModel
        .find({
            date: {
                "$lt": new Date(dateOfNewRecord),
            },
            publisherLocation: locationName
        })
        .count()
        .exec(callback)
}

exports.getPublicationAverages = getPublicationAverages
exports.index = index

// mongoose.connect(MONGO_URI, index);

// mongoose.connect(MONGO_URI, function() {
//     getPublicationAverages(
//         {
//             date: "2016-01-11",
//             weight: 100,
//             publisherLocation: "Berlin"
//         },
//         function(error, data) {
//             console.log("Done!", error, data)
//         }
//     );
// });