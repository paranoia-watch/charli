/*
 * @package charli
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

var settings = require('./settings.js')
var API = new require('./modules/backend-api/index.js')('mongo', settings.db)

