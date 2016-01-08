/*
 * @package charli
 * @subpackage peilingwijzer-parser
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

var fs = require('fs')

function readFile (filePath, callback) {
  return fs.readFile(filePath, function (error, data) {
    if (error) return console.error('Error reading file', error)
    callback(data.toString())
  })
}

module.exports = readFile
