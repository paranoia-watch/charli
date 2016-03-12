/*
 * @package charli
 * @subpackage api
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

var mongoose = require('mongoose')

function getPublicationModel () {
  return mongoose.model('Publication', getPublicationSchema())
}

function getPeilingwijzerModel () {
  return mongoose.model('Peilingwijzer', getPeilingwijzerSchema())
}

function getPublicationSchema () {
  return new mongoose.Schema({
    medium: String,
    mediumPublicationId: Number,
    publisherLocation: String,
    date: Date,
    weight: Number,
    collectionAverageAfterInsert: Number,
    locationAverageAfterInsert: Number
  })
}

function getPeilingwijzerSchema () {
  return new mongoose.Schema({
    VVD: Number,
    PvdA: Number,
    PVV: Number,
    SP: Number,
    CDA: Number,
    D66: Number,
    CU: Number,
    GL: Number,
    SGP: Number,
    PvdD: Number,
    '50PLUS': Number,
    date: Date
  })
}

exports.createPublicationModel = getPublicationModel
exports.createPeilingwijzerModel = getPeilingwijzerModel
