/*
 * @package charli
 * @subpackage api
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Boris van Hoytema <boris AT newatoms DOT com>
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

var API = new require("../")()
var publicationProcessor = API.processPublications()

publicationProcessor.on("publication-found", function(publication) {
    console.log("a publication was added!", publication)
})

publicationProcessor.on("publication-saved", function(publication) {
    console.log("a publication was saved!", publication)
})