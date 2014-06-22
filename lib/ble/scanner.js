var noble = require('noble');
var utils = require('util');
var EventEmitter = require('events').EventEmitter;

var Scanner = function () {
    EventEmitter.call(this);
    console.log("created");
}
utils.inherits(Scanner, EventEmitter);

var matches = function (peripheral, spec) {
    if (spec.id) {
        return (peripheral.uuid === spec.id);
    } 
    return (peripheral.advertisement.localName === spec.name) ;
}

Scanner.prototype.connectTo = function (spec) {
  console.log("connectto");
    var self = this;
    noble.on('discover', function (peripheral) {
        if (matches(peripheral, spec)) {
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
        } else {
            console.log("ignoring " + peripheral);
        }
    });

    console.log('Start scanning...');
    noble.startScanning([]); // XXX filtering the uuid doesn't seem to work
} 

Scanner.prototype.disconnect = function (peripheral) {
}


module.exports = Scanner;


/*
var scanner = new Scanner();
scanner.connectTo('peep');
scanner.on('connect', function () {
    console.log("found");
});
*/
