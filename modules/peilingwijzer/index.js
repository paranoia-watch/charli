/*
 * @package charli
 * @subpackage peilingwijzer
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

require('dotenv').config({silent: true, path: '../.env'})
global.settings = require('../../settings.js')

var argv = require('minimist')(process.argv.slice(2)),
  parser = require('./lib/parser'),
  backend = require('../backend/index')
global.INPUT_FILE = argv.I

function processData (callback) {
  var Backend = new backend()
  parser(function (data) {
    Backend.processPeilingwijzerData(callback || function () {})
  })
}

exports.getData = parser
exports.processData = processData
