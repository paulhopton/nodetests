var http = require("http");
var https = require("https");
var fs = require('fs');
var path = require('path')

var PORT = 8010;
var creds = {};

if (process.argv.length != 3) {
    console.log("usage: node oauth2 path/to/credentials - credentials should be a json object");
    process.exit(1);
}

var file = path.join(__dirname, process.argv[2]);
fs.readFile(file, 'utf8', function (err, data) {
    if (err) {
        console.log('Error: ' + err);
        return;
    }

    creds = JSON.parse(data);

    console.dir(creds);
});

var performCodeRequest = function (clientCode, callback){

    var options = {
        hostname: 'api.relayr.io',
        port: 443,
        path: '/oauth2/token',
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded' }
    };
    var secureReq = https.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        //res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            callback(undefined, chunk);
        });
    });

    secureReq.on('error', function(e) {
        console.log('problem with request: ' + e.message);
        callback(e);
    });

    // write data to request body
    secureReq.write(
            "client_id=" + creds.id +
            "&client_secret=" + creds.secret +
            "&code=" + clientCode
            );
    secureReq.end();
}

var writeLinkPage = function (response) {

    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write('<!DOCTYPE "html">');
    response.write('<html>');
    response.write('<head>');
    response.write('<title>Hello World Page</title>');
    response.write('</head>');
    response.write('<body>');
    response.write('<a href="https://api.relayr.io/oauth2/auth?redirect_uri=http://localhost:8010&response_type=code&client_id='+creds.id+'&scope=access-own-user-info">');
    response.write('Get a Token!');
    response.write('</a>');
    response.write('</body>');
    response.write('</html>');
    response.end();
}

var server = http.createServer(function(request, response) {

    var req = require('url').parse(request.url, true);
    var clientCode = req.query.code;

    if (clientCode) {

        console.log(clientCode);

        performCodeRequest(clientCode, function(err, body) {
            if (err) {
                response.write(err);
            } else {
                response.write(body);
            }
            response.end();
        })

    } else {
        writeLinkPage(response);
    }
});

server.listen(PORT);
console.log("Server is listening on " + PORT);
