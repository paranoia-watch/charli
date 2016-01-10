/*
 * @package charli
 * @subpackage api
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

var mongoose = require('mongoose'),
  async = require('async'),
  schemas = require('./schema'),
  peilingwijzer = require('../../peilingwijzer/index'),
  twitter = require('../../twitter/index'),
  Index = schemas.getIndexesModel,
  PeilingwijzerModel = schemas.createPeilingwijzerModel()

function connect (callback) {
  mongoose.connect(dbsettings.uri, function (error, data) {
    if (error) return callback(error)
    callback(null, data)
  })
}

function processTwitterPublications (callback) {
  console.warn('to be implemented!')
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

function savePublication(publication, callback) {
  console.log("saving publication", publication)
  var model = new PublicationModel(publication)
  model.save(callback)
}

exports.connect = connect
exports.savePublication = savePublication
exports.processPeilingwijzerData = processPeilingwijzerData
