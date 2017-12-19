"use strict";

function baseController() {
    this.tag = 'counter-controller';

    this.getTag = function() {
        return this.name;
    }

    this.getUser = function(req, res) {
        var user = null;
        if (typeof req.session.user != 'undefined') {
            user = req.session.user;
        } else if (typeof res.locals.user != 'undefined') {
            user = res.locals.user;
        }
        return user;
    }
    this._requestToLowerCase = function(req) {
        var columnsArr = [
            'first_name',
            'last_name',
            'username',
            'email_address',
            'organization_name',
            'organization_description',
            'street_number',
            'route',
            'locality',
            'administrative_area_level_1',
            'administrative_area_level_2',
            'country',
            'postal_code',
            'name'
        ]
        if (Object.keys(req.body).length > 0) {
            for (var bo in req.body) {
                if (columnsArr.indexOf(bo) > -1 && req.body[bo]) {
                    req.body[bo] = req.body[bo].toLowerCase();
                }
            }
        }
        if (Object.keys(req.query).length > 0) {
            for (var pa in req.query) {
                if (columnsArr.indexOf(bo) > -1 && req.query[pa]) {
                    req.query[pa] = req.query[pa].toLowerCase();
                }
            }
        }
    }

    this.getOrganization = function(req, res) {
        var organization = null;
        if (typeof req.session.organization != 'undefined') {
            organization = req.session.organization;
        } else if (typeof res.locals.organization != 'undefined') {
            organization = res.locals.organization;
        }
        return organization;
    }

    this.getErrorApi = function() {
        var errorApi = require(GLOBAL.API_DIR + 'error-api');
        return new errorApi();
    }

    this.rest = function(req, res) {

        var nonAuthRestList = [
            'confirmation',
            'registration',
            'login',
            'recover',
            'admin',
            'password'
        ];

        logger.debug('determine which call to invoke.');
        if (req && req.params && typeof req.params['type'] != 'undefined' && req.params['type'] != '' && req.method) {
            var restCallStr = null;
            if (req.params['id'] === '') {
                restCallStr = 'default';
            } else {
                restCallStr = req.params['id'];
            }

            //cleans the str if it has a tailing "/";
            if (restCallStr.substr(-1) === '/') {
                restCallStr = restCallStr.substr(0, restCallStr.length - 1);
            }

            if (this.ApiRouter.hasOwnProperty(restCallStr)) {
                var user = this.getUser(req, res);
                var organization = this.getOrganization(req, res);

                if (!user && nonAuthRestList.indexOf(restCallStr) == -1) {
                    if (!req.get('key')) {
                        this.getErrorApi().sendError(1026, 400, res);
                    } else if (!req.get('employee_id')) {
                        this.getErrorApi().sendError(1027, 400, res);
                    } else {
                        this.getErrorApi().sendError(1025, 400, res);
                    }
                    return;
                } else if (res.locals.user) {
                    var meta = {
                        id: organization.id,
                        name: organization.name,
                        key: organization.api_key,
                        url: req.url,
                        method: req.method.toLowerCase()
                    }
                    logger.info('info', 'API Request being accessed by organization.', meta);
                }

                var route = this.ApiRouter[restCallStr];
                this._requestToLowerCase(req);
                route(req.method.toLowerCase(), req, res, this);
            } else {
                this.getErrorApi().sendError(1011, 422, res);
                return;
            }

        } else {
            this.getErrorApi().sendError(1023, 422, res);
        }
        return this;
    }
}

module.exports = baseController;
