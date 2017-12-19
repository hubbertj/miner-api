"use strict";
/*  Title: Registration-api
    Author:  Hubbert
    Date: Oct 25 2016
    Comment: 
        This is the api which is used for Registration of patron & employee/users.
*/

function registationApi() {
    var self = this;
    var Promise = getPromise();
    this.tag = 'registation-api';
    var ModelRegistrationUser = models.registration_user;
    var ModelEmployee = models.employee_user;
    var ModelOrganization = models.organization;
    var ModelPatron = models.patron_player;
    var ModelEmployeeInvite = models.employee_invite;
    var moment = getMoment();

    this.registerUserWithCode = function(employee, req, res) {
        var hash = getHash();
        var db_employeeInvite = null;
        var passwordWithHash = getHash().generate(employee.password);
        var confimation_email_valid_until = 15; //days

        ModelEmployee.findAndCountAll({
            where: {
                email_address: { $iLike: employee.email_address },
                is_active: true
            }
        }).then(function(results) {
            if (results.count > 0) {
                return new Promise(function(resolve, reject) {
                    reject({ errNum: 1018, status: 422 });
                });
            }
            return ModelPatron.findAndCountAll({
                where: {
                    email_address: { $iLike: employee.email_address },
                    is_active: true
                }
            });
        }).then(function(result) {
            if (result && result.count > 0) {
                return new Promise(function(resolve, reject) {
                    reject({ errNum: 1018, status: 422 });
                });
            }
            return ModelEmployeeInvite.findOne({
                where: {
                    email_address: { $iLike: employee.email_address },
                    is_active: true
                }
            });
        }).then(function(result) {
            if (result) {
                db_employeeInvite = result.dataValues;
                var expireTime = moment(db_employeeInvite.expire);
                if (!hash.verify(employee.organization_hash, db_employeeInvite.code) || moment().isAfter(expireTime)) {
                    return new Promise(function(resolve, reject) {
                        reject({ errNum: 1057, status: 422 });
                    });
                }
                var updates = {
                    is_active: false,
                    expire: moment().toDate()
                }
                return ModelEmployeeInvite.update(updates, {
                    where: {
                        id: db_employeeInvite.id
                    }
                });
            }
            return new Promise(function(resolve, reject) {
                reject({ errNum: 1058, status: 422 });
            });
        }).then(function(result) {
            if (result) {
                return ModelEmployee.create({
                    first_name: employee.first_name,
                    last_name: employee.last_name,
                    username: employee.email_address,
                    email_address: employee.email_address,
                    password: passwordWithHash,
                    is_admin: db_employeeInvite.is_admin,
                    organization_id: db_employeeInvite.organization_id
                });
            }
            return new Promise(function(resolve, reject) {
                reject({ errNum: 1056, status: 500 });
            });

        }).then(function(result) {
            if (result) {
                return new Promise(function(resolve, reject) {
                    require('crypto').randomBytes(48, function(err, buffer) {
                        var genToken = buffer.toString('hex');
                        if (genToken) {
                            return resolve(genToken);
                        } else {
                            return reject(err);
                        }
                    });
                });
            } else {
                return new Promise(function(resolve, reject) {
                    reject({ errNum: 1018, status: 422 });
                });
            }
        }).then(function(token) {
            var vUntil = moment().add(confimation_email_valid_until, 'days');
            return ModelRegistrationUser.create({
                email_address: employee.email_address,
                token: token,
                valid_until: vUntil
            });
        }).then(function(result) {
            if (result) {
                var registrationUser = result.dataValues;
                getApi('email').registration(employee, registrationUser.token);
                return getApi('login').loginUser(req, employee.email_address);
            } else {
                logger.error(self.getErrorApi().getErrorMsg(9901), {
                    email_address: user_email,
                    error: 9901
                });
                return new Promise(function(resolve, reject) {
                    reject({ errNum: 1024, status: 422 });
                });
            }
        }).then(function(emp) {
            res.status(200).json({
                user: self._cleanEmployee(emp),
                success: true
            });
        }).catch(function(err) {
            if (err.errNum) {
                self.getErrorApi().sendError(err.errNum, err.status, res);
            } else {
                self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
            }
        });
    }

    this.registerUser = function(req, res) {
        var employee = req.body;

        //verify data;
        if (employee.hasOwnProperty('first_name') &&
            !this.getModelPattern('first_name').test(employee.first_name)) {
            this.getErrorApi().sendError(1035, 422, res);
            return;
        }
        if (employee.hasOwnProperty('last_name') &&
            !this.getModelPattern('last_name').test(employee.last_name)) {
            this.getErrorApi().sendError(1036, 422, res);
            return;
        }
        if (employee.hasOwnProperty('username') &&
            this.validEmail(employee.username)) {
            this.getErrorApi().sendError(1037, 422, res);
            return;
        }
        if (!employee.first_name || employee.first_name === "") {
            this.getErrorApi().sendError(1003, 403, res);
        } else if (!employee.last_name || employee.last_name === "") {
            this.getErrorApi().sendError(1004, 403, res);
        } else if (!employee.email_address || self.validEmail(employee.email_address)) {
            this.getErrorApi().sendError(1005, 403, res);
        } else if (!employee.password || employee.password === "") {
            this.getErrorApi().sendError(1006, 403, res);
        } else if (!employee.password_confirm || employee.password_confirm === "") {
            this.getErrorApi().sendError(1007, 403, res);
        } else if (employee.password_confirm != employee.password) {
            this.getErrorApi().sendError(1014, 403, res);
        } else if ((!employee.organization_name || employee.organization_name === "") && !employee.organization_type && (!employee.organization_hash || employee.organization_hash === "")) {
            this.getErrorApi().sendError(1015, 403, res);
        } else if (!employee.organization_hash && !employee.organization_type && employee.organization_name) {
            this.getErrorApi().sendError(1016, 403, res);
        } else if (!employee.organization_hash && employee.organization_type && (!employee.organization_name || employee.organization_name === "")) {
            this.getErrorApi().sendError(1017, 403, res);
        } else {

            if (employee.hasOwnProperty('organization_hash') && employee.organization_hash != null) {
                self.registerUserWithCode(employee, req, res);
                return;
            }

            var passwordWithHash = getHash().generate(employee.password);
            var employeeOrganization = 999;



            getApi('organization').create({
                name: employee.organization_name,
                description: employee.organization_description,
                has_multi_admin: true,
                type: employee.organization_type,
                api_key: self._generateApiKey()
            }).then(function(organization) {
                if (organization.dataValues.id) {
                    employeeOrganization = organization.dataValues.id;
                }
                return ModelEmployee.findAndCountAll({
                    where: {
                        email_address: { $iLike: employee.email_address },
                        is_active: true
                    }
                });
            }).then(function(results) {
                if (results.count > 0) {
                    return new Promise(function(resolve, reject) {
                        return reject(self.getErrorApi().getErrorMsg(1018));
                    });
                }
                return ModelPatron.findAndCountAll({
                    where: {
                        email_address: { $iLike: employee.email_address },
                        is_active: true
                    }
                });
            }).then(function(result) {
                if (result.count > 0) {
                    return new Promise(function(resolve, reject) {
                        return reject(self.getErrorApi().getErrorMsg(1018));
                    });
                }
                return ModelEmployee.create({
                    first_name: employee.first_name,
                    last_name: employee.last_name,
                    username: employee.email_address,
                    email_address: employee.email_address,
                    password: passwordWithHash,
                    is_admin: true, //we are admin if we are createing the organization;
                    organization_id: employeeOrganization
                });
            }).then(function(result) {
                if (result) {
                    return new Promise(function(resolve, reject) {
                        require('crypto').randomBytes(48, function(err, buffer) {
                            var genToken = buffer.toString('hex');
                            if (genToken) {
                                return resolve(genToken);
                            } else {
                                return reject(err);
                            }
                        });
                    });
                } else {
                    return new Promise(function(resolve, reject) {
                        return reject(self.getErrorApi().getErrorMsg(1018));
                    });
                }
            }).then(function(token) {
                var currentTime = new Date();
                var vUntil = currentTime.setDate(currentTime.getDate() + 14);
                return ModelRegistrationUser.create({
                    email_address: employee.email_address,
                    token: token,
                    valid_until: vUntil
                });
            }).then(function(result) {
                if (result) {
                    var registrationUser = result.dataValues;
                    getApi('email').registration(employee, registrationUser.token);
                    return getApi('login').loginUser(req, employee.email_address);
                } else {
                    logger.error(self.getErrorApi().getErrorMsg(9901), {
                        email_address: user_email,
                        error: 9901
                    });
                    return new Promise(function(resolve, reject) {
                        return reject(self.getErrorApi().getErrorMsg(1024));
                    });
                }
            }).then(function(emp) {
                res.status(200).json({
                    user: self._cleanEmployee(emp),
                    success: true
                });
            }).catch(function(err) {
                self.getErrorApi().setErrorWithMessage(err.toString(), 422, res);
            });
        }
    }

    this.createPatron = function(req, res) {

        var user = this.getUser(req, res);
        var organization = self.getOrganization(req, res);
        var patron = req.body;
        var settings = null;

        if (!patron.hasOwnProperty('address')) {
            patron.address = {
                street_number: null,
                route: null,
                locality: null,
                administrative_area_level_1: null,
                administrative_area_level_2: null,
                country: null,
                postal_code: null
            }
        }

        //verify data;
        if (patron.hasOwnProperty('first_name') &&
            !this.getModelPattern('first_name').test(patron.first_name)) {
            this.getErrorApi().sendError(1035, 422, res);
            return;
        }
        if (patron.hasOwnProperty('last_name') &&
            !this.getModelPattern('last_name').test(patron.last_name)) {
            this.getErrorApi().sendError(1036, 422, res);
            return;
        }
        if (patron.hasOwnProperty('username') &&
            this.validEmail(patron.username)) {
            this.getErrorApi().sendError(1037, 422, res);
            return;
        }

        if (patron.hasOwnProperty('phone') && patron.phone &&
            !this.getModelPattern('phone').test(patron.phone)) {
            this.getErrorApi().sendError(1046, 422, res);
            return;
        }
        if (patron.hasOwnProperty('phone') && patron.phone) {
            if (!this.getModelPattern('phone').test(patron.phone)) {
                this.getErrorApi().sendError(1046, 422, res);
                return;
            }else{
                patron.phone = patron.phone.toString();
            }
        }

        //required fields;
        if (!patron.first_name || patron.first_name === "") {
            this.getErrorApi().sendError(1003, 403, res);
        } else if (!patron.last_name || patron.last_name === "") {
            this.getErrorApi().sendError(1004, 403, res);
        } else if (!patron.email_address || self.validEmail(patron.email_address)) {
            this.getErrorApi().sendError(1005, 403, res);
        } else if (!patron.password || patron.password === "") {
            this.getErrorApi().sendError(1006, 403, res);
        } else if (!patron.password_confirm || patron.password_confirm === "") {
            this.getErrorApi().sendError(1007, 403, res);
        } else if (patron.password_confirm != patron.password) {
            this.getErrorApi().sendError(1014, 403, res);
        } else if (!patron.dob || patron.dob === "" || !moment(patron.dob, moment.ISO_8601).isValid()) {
            this.getErrorApi().sendError(1040, 403, res);
        } else {
            var passwordWithHash = getHash().generate(patron.password);
            if (!passwordWithHash) {
                this.getErrorApi().sendError(1013, 422, res);
                return;
            }

            getApi('organization').getSettings(organization.id).
            then(function(masterSettings) {
                if (masterSettings) {
                    settings = masterSettings;
                }
                return ModelPatron.findAndCountAll({
                    where: {
                        email_address: { $iLike: patron.email_address },
                        is_active: true
                    }
                });
            }).then(function(results) {
                if (results.count > 0) {
                    return new Promise(function(resolve, reject) {
                        return reject(self.getErrorApi().getErrorMsg(1018));
                    });
                }

                return ModelEmployee.findAndCountAll({
                    where: {
                        email_address: { $iLike: patron.email_address },
                        is_active: true
                    }
                });
            }).then(function(results) {
                if (results.count > 0) {
                    return new Promise(function(resolve, reject) {
                        return reject(self.getErrorApi().getErrorMsg(1018));
                    });
                }
                return getApi('employee').retrieve(user.employee_id);
            }).then(function(results) {
                var employee = results.dataValues;
                return ModelPatron.create({
                    first_name: patron.first_name,
                    last_name: patron.last_name,
                    username: patron.email_address,
                    email_address: patron.email_address,
                    password: passwordWithHash,
                    dob: patron.dob,
                    phone: patron.phone,
                    street_number: patron.address.street_number,
                    route: patron.address.route,
                    locality: patron.locality,
                    administrative_area_level_1: patron.address.administrative_area_level_1,
                    administrative_area_level_2: patron.address.administrative_area_level_2,
                    country: patron.address.country,
                    postal_code: patron.address.postal_code,
                    organization_id: employee.organization_id
                });
            }).then(function(results) {
                if (results) {
                    var newPatron = results.dataValues;
                    if (settings && settings.patron_registration_email) {
                        getApi('email').patronRegistration(newPatron, organization);
                    }
                    res.status(200).json({
                        user: self._cleanPatron(newPatron),
                        success: true
                    });
                } else {
                    return new Promise(function(resolve, reject) {
                        return reject(self.getErrorApi().getErrorMsg(1018));
                    });
                }
            }).catch(function(err) {
                self.getErrorApi().setErrorWithMessage(err.toString(), 422, res);
            });
        }
    }

    this.confirmRegistation = function(req, res) {

        return new Promise(function(resolve, reject) {
            var errorNumber = 1019;
            var errorNumberNotFound = 1020;
            var errorExpired = 1021;
            var errorTokenUsed = 1022;
            var token = req.query.token || null;
            var eo = {};
            if (!token) {
                return reject(self.getErrorApi().sendError(errorNumber, 422));
            }
            ModelRegistrationUser.findOne({ where: { token: token } })
                .then(function(registration_user) {
                    if (registration_user) {

                        //check valid until;
                        if ((new Date(registration_user.dataValues.valid_until) < new Date())) {
                            return reject(self.getErrorApi().sendError(errorExpired, 400));
                        }

                        if (!registration_user.dataValues.is_active) {
                            return reject(self.getErrorApi().sendError(errorTokenUsed, 400));
                        }
                        return ModelRegistrationUser.update({
                            is_active: false
                        }, {
                            where: {
                                token: registration_user.dataValues.token
                            }
                        }).then(function(did_update) {
                            return getApi('login').loginUser(req, registration_user.dataValues.email_address);
                        });
                    } else {
                        return reject(self.getErrorApi().sendError(errorNumberNotFound, 400));
                    }
                })
                .then(function(employee) {
                    eo.employee = employee.dataValues;
                    return resolve(employee.dataValues);
                }).catch(function(error) {
                    return reject(error);
                });
        });
    }
}

module.exports = registationApi;
