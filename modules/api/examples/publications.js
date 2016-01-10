/*
 * @package charli
 * @subpackage api
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

require('dotenv').config({silent: true, path: '../.env'})
global.settings = require('../../../settings')

var API = new require("../")()
var publicationProcessor = API.processPublications()

publicationProcessor.on("publication", function(publication) {
    console.log("\na publication was added!")
})

publicationProcessor.on("save", function(publication) {
    console.log("\na publication was saved!", publication)
})

publicationProcessor.on("save-error", function(error) {
    console.log("\na publication couldn't be saved!", error)
})