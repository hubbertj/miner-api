'use strict';

module.exports = function(Health) {

  Health.getSensorData = function() {
  	console.log("this will return the sensor data needed for the out up of get");
  };

  Health.status = function(cb) {
    //TODO: get sensor data
    this.getSensorData();
 
    cb(null, "We are good");
  };

  Health.remoteMethod(
    'status', {
      http: {
        path: '/status',
        verb: 'get'
      },
      returns: {
        arg: 'status',
        type: 'string'
      }
    }
  );
};
