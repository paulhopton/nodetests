var mqtt = require('mqtt');


var connect = function (opts) {

//client connection
    var client = mqtt.createSecureClient(opts.port,opts.host,opts);

    client.on("close", function() {
        console.log("closing client");
    });

    client.on("error", function(err) {
        console.log('errror',err);
    });


    return client;
}
var Publisher = function (spec) {

    this.client = undefined;

    this.opts={
        username:spec.transmitterId,
        password:spec.transmitterPass,
        host:process.argv[2] || "ec2-54-72-145-34.eu-west-1.compute.amazonaws.com",
        // host:"192.168.77.182",
        port:8883,
        clean:true,
        clientId:spec.sensorId
    };

};

Publisher.prototype.publish = function (data, callback) {

var self = this;
    console.log('data=' + data);

    var topic = "/s/" + this.topicBase + "/data"

    var pub = function () {
        self.client.publish(topic,JSON.stringify(data),{qos:1}, function () {
            console.log('published');
            //callback(undefined, true);
        });
    }

    if (!this.client || !this.client.connected) {
        this.client = connect(this.opts);
        this.client.on('connect', pub);
    } else {
        pub(); 
    }

}

Publisher.prototype.close = function () {
    if (this.client && this.client.connected) {
        this.client.end();
    }

}


module.exports = Publisher;
