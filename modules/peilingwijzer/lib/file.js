/*
 * @package charli
 * @subpackage peilingwijzer
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

var fileDownloader = require('./file-downloader'),
  fileReader = require('./file-reader')

function getFileContents (callback) {
  if (!INPUT_FILE) return fileDownloader(callback)
  fileReader(INPUT_FILE, callback)
}

module.exports = getFileContents
