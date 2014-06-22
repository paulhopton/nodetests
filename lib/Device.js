var Publisher = require('./mqtt/publisher');
var Scanner = require('./ble/scanner');

var scanner = new Scanner();
var useCharacteristic_ ;
var readValue_;

var Device = function (spec, connectionOpts) {

    connectionOpts.sensorId = spec.id;
    this.name = "Device";


    this.spec = spec;

    this.publisher = new Publisher(connectionOpts);


    return this;

}


Device.prototype.start = function(){

    //scan for device
    scanner.connectTo(this.spec);

    var self = this;

    //on connect
    scanner.on('connected', function (peripheral) {

        console.log("connectedi Device");
        //  establish MQTT channel

        useCharacteristic_(peripheral, "2a29", readValue_, function(reading) {
            console.log("ID="+reading);
            self.publisher.topicBase = reading;
        });
        useCharacteristic_(peripheral, 2008, setUpNotification_, function (reading) {
            self.publisher.publish(reading);
        });

    });
}

readValue_ = function(characteristic, callback){
    characteristic.read(callback);
}
/**
 * Set up the notification for changes on the Gatt charachteristic passed in 
 */
setUpNotification_ = function(characteristic, dataHandler){

    characteristic.on('read', function(buf, isNotification){
        var readings = parseReading_(buf);
        dataHandler(readings);
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

parseReading_ = function (buf) {
    var i = 0;
    var readings = {};


    ['white', 'red', 'green', 'blue', 'proximity'].forEach(function (prop) {
        readings[prop] = (buf[i+1] << 8) | buf[i];
        i += 2;
    });

    console.log( readings);
    return readings;
}

useCharacteristic_ = function (peripheral, characteristic, foundCallback, publisher) {

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
                foundCallback(c2, publisher);
            }
        });

        if (!found){
            console.log("couldn't get characteristic");
        } 
    });

}

module.exports = Device;
