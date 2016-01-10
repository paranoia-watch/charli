/*
 * @package charli
 * @subpackage backend
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

var mongoose = require('mongoose')

function getIndexesModel () {
  return mongoose.model('Index', getIndexesSchema())
}

function getPeilingwijzerModel () {
  return mongoose.model('Peilingwijzer', getPeilingwijzerSchema())
}

function getIndexesSchema () {
  return new mongoose.Schema({
    trigger: String,
    triggerId: String,
    theIndex: Number,
    weight: Number,
    date: Date,
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

exports.createIndexModel = getIndexesModel
exports.createPeilingwijzerModel = getPeilingwijzerModel
