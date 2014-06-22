var Publisher = require('./mqtt/publisher');
var Scanner = require('./ble/scanner');
var utils = require('util');
var EventEmitter = require('events').EventEmitter;

var scanner = new Scanner();


var Device = function (spec, connectionOpts) {

    connectionOpts.sensorId = spec.id;


    this.spec = spec;

    this.publisher = new Publisher(connectionOpts);

    EventEmitter.call(this);

}

utils.inherits(Scanner, EventEmitter);

Device.prototype.start = function(){

    var self = this;

    //scan for device
    scanner.connectTo(this.spec);

    //on connect
    scanner.on('connected', function (peripheral) {

        console.log("connectedi Device");
        //  establish MQTT channel

        self.subscribeToCharacteristic_(peripheral, 2008, self.spec);



        //on data
        //  publish
    });
}

/**
 * Set up the notification for changes on the Gatt charachteristic passed in 
 */
Device.prototype.setUpNotification_ = function(characteristic){

    var self = this;
    /**
     * Define the read function for when new data arrives. We convert the data from a hex string and add it to an object
     * We then emit a 'data' event with the value as the body
     */
    characteristic.on('read', function(buf, isNotification){
        var i = 0;
        var readings = {};


            ['white', 'red', 'green', 'blue', 'proximity'].forEach(function (prop) {
                readings[prop] = (buf[i+1] << 8) | buf[i];
                i += 2;
            });

            console.log( readings);
            //this.emit('data', readings);
            self.publisher.publish(readings, console.log);
            

    });

    /**
     * Set up the notification on the characteristic. it will call the read event 
     * every time it observes a change
     */
    characteristic.notify(true, function(error) {
        if(error) {
            console.log("ohoh");
        } else {
            console.log("notification on");
        }
    });
}
Device.prototype.subscribeToCharacteristic_ = function (peripheral, characteristic, spec) {

    var self = this;
    /**
     * Find our interesting charcteristic and setupNotifications
     */
    peripheral.discoverAllServicesAndCharacteristics(function(err,s,characteristicsFound){
        var found = false;

        if (err){
            console.log("error gettting characteristic");
            return err;
        } 

        console.log("specid=" + characteristic);
        characteristicsFound.forEach(function(c2) {
            console.log("foundid=" + c2);
            if (c2.uuid == characteristic){
                found = true;
                self.setUpNotification_(c2);
            }
        });

        if (!found){
            console.log("couldn't get characteristic");
        } 
    });



}



module.exports = Device;
