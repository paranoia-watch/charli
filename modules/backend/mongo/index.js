/*
 * @package charli
 * @subpackage backend
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

var mongoose = require('mongoose'),
  schemas = require('./schema')

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
  console.warn('to be implemented!')
}

function getIndexSchemaForIndexCollection () {
  return new mongoose.Schema({
    trigger: String,
    triggerId: String,
    theIndex: Number,
    weight: Number,
    date: Date,
  })
}

exports.connect = connect
exports.processPeilingwijzerData = processPeilingwijzerData
exports.getIndexesIndex = schemas.getIndexesIndex
