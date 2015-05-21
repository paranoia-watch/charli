var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.set('Content-Type', 'text/html');
    res.send('Het NCTB Terreurniveau is: "Substantieel"');
});

app.get('/api', function (req, res) {
    res.set('Content-Type', 'application/json');
    res.send({ "NCTB DTN": "Substantieel" });
});


var server = app.listen(8080, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('The fear index is running on port %s', host, port);

});
