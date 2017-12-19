"use strict";

module.exports = {

    setup: function(app) {
        var routerWeb = require('express').Router();
        var Promise = getPromise();
        var moment = getMoment();
        var organizationModal = models.organization;
        var employeeModal = models.employee_user;

        var authorization = global.getAuthorization();
        authorization.ensureRequest.options = {
            onDenied: function(req, res, next) {
                var _path = '';
                if (req.route['path']) {
                    var arr = req.route['path'].split('/');
                    _path = arr[1];
                }
                if (_path === 'admin') {
                    res.redirect('/admin');
                } else if (!req.session.user) {
                    res.redirect('/login');
                } else {
                    res.render('pages/unauthorized.ejs', {
                        data: {
                            user: req.session.user,
                            path: _path
                        }
                    });
                }
            }
        }

        // setup permission
        var isAuthorizedSuperAdmin = authorization.ensureRequest.isPermitted('restricted:superadmin');
        var isAuthorizedAdmin = authorization.ensureRequest.isPermitted('restricted:admin');
        var isAuthorized = authorization.ensureRequest.isPermitted('restricted:employee');

        routerWeb.get("/", isAuthorized, function(req, res) {
            res.redirect("/dashboard");
        });

        //admin routes
        routerWeb.get("/admin", function(req, res) {
            if (req.session.user) {
                var permissions = req.session.user.permissions[0];
                var pArr = permissions.split(",");
                if (pArr.indexOf("superadmin") > -1 || pArr.indexOf("restricted:superadmin") > -1 ) {
                    res.redirect('/admin/dashboard');
                    return;
                }
            }
            res.render("pages/admin/admin_login.ejs", {
                title: 'Admin Login',
                layout: 'layouts/html_admin.ejs',
                data: {}
            });
        });

        routerWeb.get("/admin/dashboard", isAuthorizedSuperAdmin, function(req, res) {
            var uptime = moment().subtract(process.uptime(), 'seconds');
            res.render("pages/admin/admin.ejs", {
                title: 'Admin Dashboard',
                layout: 'layouts/html_admin.ejs',
                data: {
                    uptime: uptime,
                    settings: global.config
                }
            });
        });
        // -- end

        routerWeb.get("/dashboard", isAuthorized, function(req, res) {
            if (req.session && req.session.user) {
                var time_spans = getApi("dashboard").getTimeSpans().enums;
                var user_data = {
                    employee_id: req.session.user.id,
                    username: req.session.user.username,
                    first_name: req.session.user.first_name,
                    last_name: req.session.user.last_name,
                    email_address: req.session.user.email_address
                }
                res.render("pages/dashboard.ejs", {
                    data: {
                        user: user_data,
                        timeSpans: time_spans,
                        ts: moment().unix()
                    }
                });
            } else {
                res.redirect("/login");
            }
        });

        routerWeb.get('/login', function(req, res) {
            if (req.session.user) {
                res.redirect('/dashboard');
            } else {
                var Organization_types = models.organization_type;
                Organization_types.all().then(function(organization_types) {
                    res.render('pages/login.ejs', {
                        data: {
                            organization_types: organization_types,
                            ts: moment().unix()
                        }
                    });
                });
            }
        });
        routerWeb.get('/game', isAuthorized, function(req, res) {
            res.render('pages/game.ejs', {
                data: {
                    user: 'counterDraft_user',
                    ts: moment().unix()
                }
            });
        });

        routerWeb.get('/patron', isAuthorized, function(req, res) {
            var user = req.session.user;
            if (!user.employee_id) {
                res.redirect('/logout');
            }
            getApi('employee').retrieve(user.employee_id)
                .then(function(results) {
                    var employee = results.dataValues;
                    return getApi('organization').retrieve(employee.organization_id);
                }).then(function(results) {
                    var organization = results.dataValues;
                    res.render('pages/patron.ejs', {
                        data: {
                            organization: {
                                name: organization.name,
                                id: organization.id,
                                description: organization.description
                            },
                            dir: {
                                image_dir: global.config['image_dir'],
                                image_bucket_url: global.config['image_bucket_url']
                            },
                            employee: {
                                is_admin: user.is_admin
                            },
                            ts: moment().unix()
                        }
                    });
                }).catch(function(err) {
                    logger.log('Error', 'Failed to retrieve employee, check database connection.', { error: err });
                    res.redirect('/logout');
                });
        });

        routerWeb.get('/account', isAuthorized, function(req, res) {
            var employee = {
                    id: req.session.user.employee_id,
                }
                //TODO: see if a image exist;
            var client = getS3Client();
            res.render('pages/account.ejs', {
                data: {
                    employee: employee,
                    dir: {
                        image_dir: global.config['image_dir'],
                        image_bucket_url: global.config['image_bucket_url']
                    },
                    extra: {
                        does_file_exist: false
                    },
                    ts: moment().unix()
                }
            });
        });

        routerWeb.get('/organization', isAuthorizedAdmin, function(req, res) {
            var session = req.session;
            if (!session.organization || !session.user) {
                res.redirect('/logout');
            }
            res.render('pages/organization.ejs', {
                data: {
                    organization: session.organization,
                    employee: {
                        id: session.user.employee_id,
                        is_admin: session.user.is_admin,
                        username: session.user.username,
                        first_name: session.user.first_name,
                        last_name: session.user.last_name,
                        email_address: session.user.email_address
                    },
                    ts: moment().unix()
                }
            });
        });

        routerWeb.get('/reports', isAuthorized, function(req, res) {
            res.render('pages/reports.ejs', {
                data: {
                    user: 'counterDraft_user',
                    ts: moment().unix()
                }
            });
        });

        routerWeb.get('/confirmation', function(req, res) {
            if (req.session.user) {
                res.redirect('/dashboard');

            } else {
                res.locals.login = false;
                getApi('registration').confirmRegistation(req, res)
                    .then(function(data) {
                        res.render('pages/confirmation.ejs', {
                            data: {
                                email_address: data.email_address,
                                ts: moment().unix()
                            }
                        });
                    }).catch(function(error) {
                        res.render('pages/confirmation.ejs', {
                            data: error
                        });
                    });
            }

        });
        routerWeb.get('/retrieve', function(req, res) {
            if (req.session.user) {
                res.redirect('/dashboard');
            } else {
                var errorApi = getApi('error');
                var errorObj = errorApi.getError(errorApi.getErrorMsg(1051));
                res.locals.login = false;
                var params = req.query;
                var retrieve_token = req.query.retrieve_token || null;
                var email_address = req.query.email_address || null;
                getApi('reset').checkPasswordResetToken(retrieve_token, email_address)
                    .then(function(result) {
                        var modelType = result.$modelOptions.name.singular;
                        var data = {};
                        if (modelType === 'patron_player') {
                            data.patron = errorApi._cleanPatron(result.dataValues);
                        } else if (modelType === 'employee_user') {
                            data.employee = errorApi._cleanEmployee(result.dataValues);
                        } else {
                            logger.error("Bad token reqest", { error: err });
                            res.render('pages/retrieve.ejs', {
                                data: {
                                    error: errorObj,
                                    ts: moment().unix()
                                }
                            });
                            return;
                        }
                        res.render('pages/retrieve.ejs', {
                            data: data
                        });
                    }).catch(function(err) {
                        logger.error("Bad token reqest", { error: err });
                        res.render('pages/retrieve.ejs', {
                            data: {
                                error: errorObj,
                                ts: moment().unix()
                            }
                        });
                    });
            }
        });
        routerWeb.get('/settings', isAuthorized, function(req, res) {
            res.render('pages/reports.ejs', {
                data: {
                    user: 'counterDraft_user',
                    ts: moment().unix()
                }
            });
        });
        routerWeb.get('/logout', function(req, res) {
            req.session.destroy(function() {
                res.redirect('/login');
                res.end();
            });
        });

        routerWeb.get('/*', function(req, res, next) {
            if (req.originalUrl.split('/').indexOf('api') > -1 || req.originalUrl.split('/').indexOf('application') > -1) {
                next();
            } else if (req.session.user) {
                res.render('pages/badURL.ejs', {
                    data: {
                        user: req.session.user,
                        ts: moment().unix()
                    }
                });
            } else {
                res.redirect('/login');
            }
        });

        //pre-route
        app.use(function(req, res, next) {
            var self = this;
            //defaults variables;
            res.locals.login = false;
            res.locals.user = null;
            res.locals.organization = null;
            res.locals.environment = global.config['environment'];
            res.locals.npm_package_name = global.config['npm_package_name'];
            res.locals.google_maps_key = global.config['google_maps_key'];

            if (typeof req.session.user != 'undefined') {
                res.locals.login = true;
            }

            //gets data from header and addes it to the api_user
            if (!res.locals.login && req.headers && req.get('key') && req.get('employee_id')) {
                var key = req.get('key');
                var employee_id = req.get('employee_id');
                organizationModal.findOne({
                    where: {
                        api_key: key
                    }
                }).then(function(result) {
                    if (result) {
                        var organization = result.dataValues;
                        res.locals.organization = organization;
                        return employeeModal.findOne({
                            where: {
                                id: employee_id,
                                organization_id: organization.id
                            }
                        });
                    } else {
                        var err = {
                            key: key,
                            modal: 'organization'
                        };
                        logger.error('Error', 'API CALL FAILED - Couldn\'t find organization from key', { error: err });
                        return new Promise(function(resolve, reject) {
                            reject({ errNum: 1030, status: 401 });
                        });
                    }

                }).then(function(result) {
                    if (result) {
                        res.locals.user = result.dataValues;
                        //keep going;
                        next();
                    } else {
                        var err = {
                            employee_id: employee_id,
                            modal: 'employee'
                        };
                        logger.error('Error', 'API CALL FAILED - Couldn\'t find employee in organization', { error: err });
                        return new Promise(function(resolve, reject) {
                            reject({ errNum: 1029, status: 401 });
                        });
                    }
                }).catch(function(err) {
                    if (err.errNum) {
                        getApi('error').sendError(err.errNum, err.status, res);
                    } else {
                        getApi('error').setErrorWithMessage(err.toString(), 500, res);
                    }
                    return;
                });
            } else {
                //keep going;
                next();
            }
        });

        app.use('', routerWeb);
    }
};
