/*
 * @package charli
 * @subpackage peilingwijzer
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

var peilingWijzer = require(__dirname + '/../index')

peilingWijzer.getData(function (data) {
  console.log(data)
})
