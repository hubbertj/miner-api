'use strict';

const systeminformation = require('systeminformation');


module.exports = function(app) {

  /**
   * Used for getting the server health;
   * @param  {[type]} app [description]
   * @return {[type]}     [description]
   */
  app.get('/health', function(req, res) {

    var serverData = [];

    systeminformation.cpuTemperature()
      .then(function(data) {
        serverData.push(data);
        res.send(data);
      }).catch(function(err) {
        console.log(err);
        res.send({ error: err });
      })

  });

  /**
   * used to reboot the server, you need the secert key to do this.
   * @param  {[type]} req  [description]
   * @param  {Array}  res) {               var serverData [description]
   * @return {[type]}      [description]
   */
  app.get('/reboot', function(req, res) {

    var serverData = [];

    systeminformation.cpuTemperature()
      .then(function(data) {
        serverData.push(data);
        res.send(data);
      }).catch(function(err) {
        console.log(err);
        res.send({ error: err });
      })

  });
}
