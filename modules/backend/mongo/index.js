/*
 * @package charli
 * @subpackage backend
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

var mongoose = require('mongoose'),
  async = require('async'),
  schemas = require('./schema'),
  peilingwijzer = require('../../peilingwijzer/index'),
  Index = schemas.getIndexesModel,
  PeilingwijzerModel = schemas.createPeilingwijzerModel()

function connect (callback) {
  mongoose.connect(dbsettings.uri, function (error, data) {
    if (error) return callback(error)
    callback(null, data)
  })
}

function createIndex (callback) {
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

exports.connect = connect
exports.createIndex = createIndex
exports.processPeilingwijzerData = processPeilingwijzerData
