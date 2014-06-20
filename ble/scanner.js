var noble = require('noble');
var utils = require('util');
var EventEmitter = require('events').EventEmitter;

var Scanner = function () {
    EventEmitter.call(this);
    console.log("created");
}
utils.inherits(Scanner, EventEmitter);

Scanner.prototype.connectTo = function (uuid) {
  console.log("connectto");
    noble.on('discover', function (peripheral) {
        if (peripheral.id === uuid) {
            // we need to connect before reading
            peripheral.connect(function (err) {
                if (err) return self.emit('error', err);

                //Disconnect the device if we exit the programme
                process.on('exit', function () {
                    console.log("exiting");
                    peripheral.disconnect();
                });

                console.log('Connected to', peripheral.uuid);
                // no need to scan for it anymore
                console.log("stopped scanning ");
                noble.stopScanning();

                self.emit('connected', peripheral);
            });
        }
        console.log("ignoring " + peripheral.id);
    });

    console.log('Start scanning...');
    noble.startScanning([]); // XXX filtering the uuid doesn't seem to work
} 

Scanner.prototype.disconnect = function (uuid) {
}




var scanner = new Scanner();
scanner.connectTo('peep');
scanner.on('connect', function () {
    console.log("found");
});

