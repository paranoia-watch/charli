/*
 * @package charli
 * @subpackage peilingwijzer
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

require('dotenv').config({silent: true, path: '../.env'})
global.settings = require('../../settings.js')

var argv = require('minimist')(process.argv.slice(2))
var parseFile = require('./lib/parser')
var getFile = require('./lib/file')

global.INPUT_FILE = argv.I

function getData (callback) {
  getFile(function (fileContents) {
    var data = parseFile(fileContents)
    callback(data)
  })
}

exports.getData = getData
