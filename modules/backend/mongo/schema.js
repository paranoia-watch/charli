/*
 * @package charli
 * @subpackage backend
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

var mongoose = require('mongoose')

function getIndexesIndex () {
  return mongoose.model('Index', getIndexesSchema())
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

exports.getIndexesIndex = getIndexesIndex
