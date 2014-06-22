var noble = require('noble');
var utils = require('util');
var EventEmitter = require('events').EventEmitter;
/**
 * @constructor
 */
var Scanner = function () {
    EventEmitter.call(this);
    console.log("created");
}
utils.inherits(Scanner, EventEmitter);

/**
 * compares the Sensor to te spec provided
 *
 * @param {Peripheral} peripheral a BLE peripheral which we want to check
 * @param {Object}  spec - the matching specification. Must contain either name
 * or id. If an ID to match is provided only a peripheral with that UUID will
 * be matched, otherwise any peripheral with the name will be selected
 *
 * @return true or false if the sensor matches the specification
 */
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
    peripheral.disconnect();
}


module.exports = Scanner;


/*
var scanner = new Scanner();
scanner.connectTo('peep');
scanner.on('connect', function () {
    console.log("found");
});
*/
