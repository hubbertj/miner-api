"use strict";
/*  Title: Reset-api
    Author:  Hubbert
    Date: Oct 11 2016
    Comment: 
        This is the api which is used for all reseting stuff all logic should be here.
*/
var _generateToken = function() {
    var uuid = generateUUID().replace(/-/g, "");
    if (uuid) {
        return uuid;
    }
}

function ResetApi() {
    var self = this;
    this.tag = 'reset-api';
    var Promise = getPromise();
    var ModelEmployee = models.employee_user;
    var ModelPatron = models.patron_player;
    var moment = getMoment();

    this.checkPasswordResetToken = function(token, email_address) {
        var self = this;
        var hash = getHash();

        return new Promise(function(resolv, rejec) {
            if (!token || !email_address) {
                rejec(1051);
                return;
            }
            ModelEmployee.findOne({
                where: {
                    email_address: { $iLike: email_address },
                    is_active: true
                }
            }).then(function(result) {
                if (result) {
                    return new Promise(function(resolve, reject) {
                        resolve(result);
                    });
                } else {
                    return ModelPatron.findOne({
                        where: {
                            email_address: { $iLike: email_address },
                            is_active: true
                        }
                    });
                }
            }).then(function(result) {
                if (result) {
                    var user = result.dataValues;
                    if (hash.verify(token, user.retrieve_token) && moment().isBefore(moment(user.retrieve_expiration))) {
                        resolv(result);
                    } else {
                        rejec(1051);
                    }
                } else {
                    rejec(9905);
                }
            }).catch(function(err) {
                rejec(err);
            });
        });
    }
    this._verifyInformation = function(data) {
        var errorNumber = null;
        if (data.hasOwnProperty('first_name') &&
            !this.getModelPattern('first_name').test(data.first_name)) {
            errorNumber = 1035;
        }
        if (data.hasOwnProperty('last_name') &&
            !this.getModelPattern('last_name').test(data.first_name)) {
            errorNumber = 1036;
        }
        if (data.hasOwnProperty('username') &&
            this.validEmail(data.username)) {
            errorNumber = 1037;
        }
        if (data.hasOwnProperty('email_address') &&
            this.validEmail(data.email_address)) {
            errorNumber = 1038;
        }
        var isCorrupt = false;
        if (errorNumber) {
            isCorrupt = true;
        }
        return {
            errNum: errorNumber,
            isCorrupt: isCorrupt
        }
    }

    this.admin_resetPassword = function(req, res) {
        var user = self.getUser(req, res);
        var organization = self.getOrganization(req, res);
        var putData = req.body;
        var chckData = this._verifyInformation(putData);
        var newPassword = 'password';
        var newPasswordWithHash = 'password';
        var passGen = getPasswordGenerator();
        var employeeJson = null;

        if (passGen) {
            newPassword = passGen.generate({
                length: 15,
                uppercase: false
            });
        }
        newPasswordWithHash = getHash().generate(newPassword);
        if (chckData.isCorrupt) {
            this.getErrorApi().sendError(chckData.errNum, 422, res);
            return;
        }
        if (!putData.hasOwnProperty('email_address') || !putData.email_address || putData.email_address === '') {
            this.getErrorApi().sendError(1010, 422, res);
            return;
        }
        if (!putData.hasOwnProperty('id') || !putData.id) {
            this.getErrorApi().sendError(1031, 422, res);
            return;
        }

        ModelEmployee.findOne({
            where: {
                id: user.id
            }
        }).then(function(result) {
            if (result) {
                var employee = result.dataValues;
                if (!employee.is_admin) {
                    return new Promise(function(resolve, reject) {
                        reject({ errNum: 1050, status: 401 });
                    });
                }
            }
            return ModelEmployee.findOne({
                where: {
                    id: putData.id
                }
            });
        }).then(function(result) {
            if (result) {
                employeeJson = result.dataValues;
                var updates = {
                    password: newPasswordWithHash
                }
                return ModelEmployee.update(updates, {
                    where: {
                        id: employeeJson.id
                    }
                });
            }
            return new Promise(function(resolve, reject) {
                reject({ errNum: 1029, status: 500 });
            });
        }).then(function(result) {
            if (result) {
                getApi('email').sendEmployeeNewPassword(employeeJson, newPassword);
                res.status(200).json({
                    employee: self._cleanEmployee(employeeJson),
                    success: true
                });
                return;
            }
            self.getErrorApi().sendError(1033, 500, res);
        }).catch(function(err) {
            if (err.errNum) {
                self.getErrorApi().sendError(err.errNum, err.status, res);
            } else {
                self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
            }
        });
    }

    this.resetPassword = function(req, res) {

        var user = self.getUser(req, res);
        var organization = self.getOrganization(req, res);
        var token = _generateToken();
        var tokenHash = getHash().generate(token);
        var eTime = moment().add('m', 45);
        var empOut = null;
        var patronOut = null;
        var settings = null;

        if (!req.body.email_address) {
            this.getErrorApi().sendError(1010, 400, res);
            return;
        } else if (this.validEmail(req.body.email_address)) {
            this.getErrorApi().sendError(1005, 403, res);
            return;
        }
        var updates = {
            retrieve_token: tokenHash,
            retrieve_expiration: eTime.format()
        }
        ModelPatron.find({
            where: {
                email_address: { $iLike: req.body.email_address },
                is_active: true
            }
        }).then(function(results) {
            if (results) {
                patronOut = results.dataValues;

                return getApi('organization').getSettings(patronOut.organization_id).then(function(masterSettings) {
                    if (masterSettings) {
                        settings = masterSettings;
                    }

                    eTime = moment().add('m', settings.password_expire_time);
                    updates.retrieve_expiration = eTime.format();
                    patronOut = mix(patronOut).into(updates);
                    return ModelPatron.update(
                        updates, {
                            where: {
                                id: patronOut.id
                            }
                        });
                });
            }
            return ModelEmployee.find({
                where: {
                    email_address: { $iLike: req.body.email_address },
                    is_active: true
                }
            });
        }).then(function(results) {
            if (results && results.hasOwnProperty('dataValues')) {
                empOut = results.dataValues;
            
                return getApi('organization').getSettings(empOut.organization_id).then(function(masterSettings) {
                    if (masterSettings) {
                        settings = masterSettings;
                    }
     
                    eTime = moment().add('m', settings.password_expire_time);
                    updates.retrieve_expiration = eTime.format();
                    empOut = mix(empOut).into(updates);
                    return ModelEmployee.update(
                        updates, {
                            where: {
                                id: empOut.id
                            }
                        });
                });
            } else if (results) {
                return new Promise(function(resolve, reject) {
                    return resolve(results);
                });
            } else {
                return new Promise(function(resolve, reject) {
                    reject({ errNum: 1002, status: 401 });
                });
            }
        }).then(function(results) {
            if (results) {
                if (empOut) {
                    getApi('email').resetPassword(empOut, token);
                    res.status(200).json({
                        user: self._cleanPatron(empOut),
                        success: true
                    });
                } else if (patronOut) {
                    getApi('email').resetPassword(patronOut, token);
                    res.status(200).json({
                        user: self._cleanPatron(patronOut),
                        success: true
                    });
                } else {
                    return new Promise(function(resolve, reject) {
                        reject({ errNum: 1002, status: 401 });
                    });
                }
            } else {
                return new Promise(function(resolve, reject) {
                    reject({ errNum: 1002, status: 401 });
                });
            }
        }).catch(function(err) {
            if (err.errNum) {
                self.getErrorApi().sendError(err.errNum, err.status, res);
            } else {
                self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
            }
        });
    }
}

module.exports = ResetApi;
