/*
 * @package charli
 * @subpackage peilingwijzer
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

var https = require('https')

function downloadFileContentsFromURL (callback) {
  var chunks = []
  https.get('https://dl.dropboxusercontent.com/u/31727287/Peilingwijzer/Last/Results_DyGraphs.txt', function (res) {
    res.on('data', function (chunk) {
      chunks.push(chunk)
    })
    res.on('end', function () {
      var data = chunks.join('').toString()
      callback(data)
    })
  })
}

module.exports = downloadFileContentsFromURL
