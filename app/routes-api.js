"use strict";
var version  = "/api/v1";

module.exports = {
    setup: function(app) {
        var router = require('express').Router();
        
        //used for checking errors;
        var CONTROLLERS = [
            'registration',
            'patron',
            'account',
            'dashboard',
            'verify',
            'reset',
            'application',
            'game',
            'user',
            'organization']

        // Register account
        router.all(version + '/:type(registration)/:id(*)', function(req, res) {
           getController('account').rest(req, res);
        });

        router.all(version + '/:type(patron)/:id(*)', function(req, res) {
            getController('patron').rest(req, res);
        });

        router.all(version + '/:type(game)/:id(*)', function(req, res) {
            getController('game').rest(req, res);
        });

        router.all(version + '/:type(user)/:id(*)', function(req, res) {
            getController('user').rest(req, res);
        });

        // Account Controller - This should do control any call account related.
        router.all(version + '/:type(account)/:id(*)', function(req, res) {
            getController('account').rest(req, res);
        });

        // Dashboard Controller
        router.all(version + '/:type(dashboard)/:id(*)', function(req, res) {
            getController('dashboard').rest(req, res);
        });

        // Verify account
        router.all(version + '/:type(verify)/:id(*)', function(req, res) {
            getController('account').rest(req, res);
        });

        // Reset password
        router.all(version + '/:type(reset)/:id(*)', function(req, res) {
            getController('reset').rest(req, res);
        });

        // Application servers.
        router.all(version +'/:type(application)/:id(*)', function(req, res){
            getController('application').rest(req, res);
        });

        // Organization
        router.all(version + '/:type(organization)/:id(*)', function(req, res) {
            getController('organization').rest(req, res);
        });

        // Error router.
        router.all([version +'/:type(*)', version + '/*'], function(req, res){
            var error = require(GLOBAL.API_DIR + 'error-api');
            var errorApi = new error();
            if(req.params['type'] && CONTROLLERS.indexOf(req.params['type']) > -1){
                var urls = req.url.split('?');
                var urlWithSlash = req.url + '/';
                if(urls.length === 2){
                    urlWithSlash = urls[0] + '/?' + urls[1];
                }
                res.redirect(urlWithSlash);
            }else{
                errorApi.sendError(1024, 422, res);
            }
        });

        app.use('', router);
    },
};
