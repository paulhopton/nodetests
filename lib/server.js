var express = require('express');
var app = express();
var Device = require('./Device');
var http = require('http');
var path = require('path');

app.engine('jade', require('jade').__express);
//app.set('views', config.web.views);
app.set('view engine', 'jade');
//app.use(express.static(config.web.assets));

app.get('/', function (req, res) {
        res.render('index');
});

var PORT = 8010;
var opts = {
    transmitterId:'relayr',
    transmitterPass:'relayr'
};

var server = http.createServer(app).listen(PORT, function () {
    console.log('HTTP server listening on port', PORT);
    var d = new Device({'name':'WunderbarLIGHT'}, opts);
    d.start();
});

