/*
 * @package charli
 * @subpackage peilingwijzer-parser
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

var argv = require('minimist')(process.argv.slice(2)),
  parser = require('./lib/parser')
global.INPUT_FILE = argv.I

exports.getData = parser
