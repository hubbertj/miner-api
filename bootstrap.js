module.exports = {
    init: function() {
        global.dirBase = process.env.PWD;
        global.mix = require('mix-into');

        // Setup the configuration
        try {
            var local_config = require('./config/local_config');
            global.config = mix(require('./config/master_config'))
                .into(require('./config/local_config'));
        } catch (err) {
            console.error('No local configurations found in config/ Error=' + JSON.stringify(err));
            global.config = require('./config/master_config');
        }

        global.getDatabase_url = function() {
            if (global.config.database_url) {
                return global.config.database_url;
            } else if (global.config.database) {
                database_url = 'postgres://' + global.config.database.user +
                    ':' + global.config.database.password +
                    '@' + global.config.database.host +
                    ':' + global.config.database.port +
                    '/' + global.config.database.database;
                return database_url;
            } else {
                return null;
            }
        }

        global.getUtil = require('util');
        global.Enum = require('enum');

        global.BASE_URL = 'http://' + global.config.server.ip + ':' + global.config.server.port + '/';
        global.CONTROLLER_DIR = dirBase + '/app/controllers/';
        global.MODEL_DIR = dirBase + '/app/models/';
        global.REPOSITORY_DIR = dirBase + '/app/repositories/';
        global.API_DIR = dirBase + '/app/api/';
        global.BASE_DIR = dirBase + '/app/base/';

        global.getPromise = function() {
            return require('bluebird');
        }

        global.getEmailTemplate = function() {
            var EmailTemplates = require('swig-email-templates');
            return new EmailTemplates();
        }

        global.getdbConnection = function() {
            return require('pg');
        }

        global.getS3 = function() {
            return require('s3');
        }

        global.generateUUID = function() {
            var uuid = require('uuid');
            return uuid.v4();
        }

        global.getMoment = function() {
            return require('moment');
        }

        global.getAuthorization = function() {
            return require('express-authorization');
        }

        global.getExpressSession = function() {
            return require('express-session');
        }

        global.getController = function(controllerName) {
            var Controller = require(global.CONTROLLER_DIR + controllerName + '-controller');
            return mix(getBase('counter-controller')).into(new Controller());
        }

        global.getApi = function(apiName) {
            var api = require(global.API_DIR + apiName + '-api');
            return mix(getBase('counter-api')).into(new api());
        }

        global.getRepository = function(repositoryName) {
            var repository = require(global.REPOSITORY_DIR + repositoryName);
            return mix(getBase('counter-repository')).into(new repository());
        }

        global.getBase = function(base) {
            var baseController = require(global.BASE_DIR + base);
            return new baseController();
        }

        global.getModel = function(modelName) {
            var Model = require(global.MODEL_DIR + modelName);
            return new Model();
        }

        global.getHash = function() {
            return require('password-hash');
        }
        
        global.getPasswordGenerator = function(){
            return require('generate-password');
        }

        global.getValidator = function() {
            var validator = require('validator');
            validator.extend('isPassword', function(str) {
                // TODO: Finish writing the regex to test passwords
                if (!str) {
                    return false;
                }
                return true;
                //return /^$/.test(str);
            });
            return new Validator();
        }

        global.getDateFormatter = function() {
            return require('dateformat');
        }

        //creaete transportor
        global.getEmailTransport = function(){
            return require('./lib/nodemailer').createTransport(global.config.email);
        }

        global.logger = require('./lib/logger').init();
        global.models = require("./models");

        global.getS3Client = function() {
            return require('s3').createClient({
                maxAsyncS3: 20,
                s3RetryCount: 3,
                s3RetryDelay: 1000,
                multipartUploadThreshold: 20971520,
                multipartUploadSize: 15728640,
                s3Options: {
                    accessKeyId: global.config['aws_access_key_id'],
                    secretAccessKey: global.config['aws_secret_access_key'],
                    // any other options are passed to new AWS.S3() 
                    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property 
                }
            });
        }
    }
}
