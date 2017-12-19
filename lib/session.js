// This file is used to manage a session fo the express lib, its also
// a wrapper for UUID lib and express-session.

//Defines that JavaScript code should be executed in "strict mode".
"use strict";

var session = require('express-session');
var pgSession = require('connect-pg-simple')(session);
var parseDbUrl = require("parse-database-url");

var _tableName = "session";

var _createSessionTable = function() {
    var dbConfig = parseDbUrl(global.getDatabase_url());
    var pg = global.getdbConnection();
    var client = new pg.Client(dbConfig);

    // connect to our database 
    client.connect(function(err) {
        if (err) logger.error(err);

        client.query('CREATE TABLE IF NOT EXISTS "session" ("sid" varchar NOT NULL COLLATE "default", "sess" json NOT NULL, "expire" timestamp(6) NOT NULL) WITH (OIDS=FALSE);', [], function(err, result) {
            if (err) logger.error(err);
            logger.info('Create session table ');

            client.query('ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;', [], function(err, result) {
                if (err) {
                    logger.info('Session table already has proper constraints.\n' + err);
                } else {
                    logger.info('Add constraint to session table.');
                }
                client.end(function(err) {
                    if (err) logger.error(err);
                });

            });
        });
    });
}

module.exports = function() {
    _createSessionTable();
    return session({
        cookieName: _tableName,
        duration: 30 * 60 * 1000,
        activeDuration: 5 * 60 * 1000,
        secret: global.config.secret,
        secure: global.config.secure_cookies,
        saveUninitialized: false,
        resave: true,
        httpOnly: true,
        genid: function(req) {
            return global.generateUUID();
        },
        store: new pgSession({
            pg: global.getdbConnection(),
            conString: global.getDatabase_url()
        })
    });
}
