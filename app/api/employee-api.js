"use strict";
/*  Title: Employee-Api
    Author:  Hubbert
    Date: Oct 07 2016
    Comment: 
        This is the api which is used for all employee calls / managment.
*/

function EmployeeApi() {
    var self = this;
    this.tag = 'employee-api';
    var Promise = getPromise();
    var ModelEmployee = models.employee_user;
    var ModelPatron = models.patron_player;

    this._verifyInformation = function(employee, options) {
        var errorNumber = null;
        if (employee.hasOwnProperty('id') && !options.hasOwnProperty('type')) {
            errorNumber = 1034;
        }
        if (employee.hasOwnProperty('first_name') &&
            !this.getModelPattern('first_name').test(employee.first_name)) {
            errorNumber = 1035;
        }
        if (employee.hasOwnProperty('last_name') &&
            !this.getModelPattern('last_name').test(employee.first_name)) {
            errorNumber = 1036;
        }
        if (employee.hasOwnProperty('username') &&
            this.validEmail(employee.username)) {
            errorNumber = 1037;
        }
        if (employee.hasOwnProperty('email_address') &&
            this.validEmail(employee.email_address)) {
            errorNumber = 1038;
        }
        if (employee.hasOwnProperty('password')) {
            errorNumber = 1034;
        }
        if (employee.hasOwnProperty('organization_id')) {
            errorNumber = 1034;
        }
        if (employee.hasOwnProperty('e_uuid')) {
            errorNumber = 1034;
        }
        if (employee.hasOwnProperty('createdAt')) {
            errorNumber = 1034;
        }
        if (employee.hasOwnProperty('updatedAt')) {
            errorNumber = 1034;
        }
        var isCorrupt = false;
        if (errorNumber) {
            isCorrupt = true;
        }
        return {
            errNum: errorNumber,
            isCorrupt: isCorrupt
        };
    }

    this.retrieve = function(employee_id) {
        return ModelEmployee.findOne({
            where: {
                id: employee_id,
                is_active: true
            }
        });
    }

    this.update_admin = function(req, res) {
        var user = self.getUser(req, res);
        var organization = self.getOrganization(req, res);
        var putData = req.body;
        var employeeJson = null;
        var adminCount = null;
        var settings = null;
        var organizationApi = getApi('organization');

        var chckData = this._verifyInformation(putData, { type: 'admin' });
        if (chckData.isCorrupt) {
            this.getErrorApi().sendError(chckData.errNum, 422, res);
            return;
        }
        if (!putData.hasOwnProperty('id')) {
            this.getErrorApi().sendError(1012, 422, res);
            return;
        }
        organizationApi.getSettings(organization.id)
            .then(function(result) {
                if (result) {
                    settings = result;
                    if (settings.multi_admin) {
                        return organizationApi.getAdministrators(organization.id);
                    }
                }
                return ModelEmployee.findOne({
                    where: {
                        id: user.employee_id,
                        is_active: true
                    }
                });
            }).then(function(result) {
                if (result.hasOwnProperty('dataValues')) {
                    return new Promise(function(resolve, reject) {
                        resolve(result);
                    });
                } else if (result) {
                    var adminCount = result.length;
                    return ModelEmployee.findOne({
                        where: {
                            id: user.employee_id,
                            is_active: true
                        }
                    });
                } else {
                    return new Promise(function(resolve, reject) {
                        reject({ errNum: 1024, status: 500 });
                    });
                }
            }).then(function(result) {
                if (result) {
                    var employee = result.dataValues;
                    if (!employee.is_admin) {
                        return new Promise(function(resolve, reject) {
                            reject({ errNum: 1050, status: 401 });
                        });
                    }
                    if (putData.hasOwnProperty('is_admin') && settings.multi_admin && adminCount === 1) {
                        return new Promise(function(resolve, reject) {
                            reject({ errNum: 1061, status: 403 });
                        });
                    }
                    if (putData.hasOwnProperty('is_admin') && !settings.multi_admin) {
                        return new Promise(function(resolve, reject) {
                            reject({ errNum: 1062, status: 403 });
                        });
                    }
                    return ModelEmployee.findOne({
                        where: {
                            id: putData.id,
                            is_active: true
                        }
                    });
                } else {
                    return new Promise(function(resolve, reject) {
                        reject({ errNum: 1024, status: 500 });
                    });
                }
            }).then(function(result) {
                if (result) {
                    var employee = result.dataValues;
                    var updateData = {};
                    var userData = req.body || null;
                    if (putData) {
                        delete putData.id;
                        for (var x in putData) {
                            if (employee.hasOwnProperty(x) && employee[x] !== putData[x]) {
                                updateData[x] = putData[x];
                            }
                        }
                        if (updateData.hasOwnProperty('email_address')) {
                            updateData['is_email_confirmed'] = false;

                            return ModelPatron.findAndCountAll({
                                where: {
                                    email_address: { $iLike: updateData.email_address },
                                    is_active: true
                                }
                            }).then(function(result) {
                                if (result && result.count > 0) {
                                    return new Promise(function(resolve, reject) {
                                        return reject(self.getErrorApi().getErrorMsg(1018));
                                    });
                                }
                                return ModelEmployee.findAndCountAll({
                                    where: {
                                        email_address: { $iLike: updateData.email_address },
                                        is_active: true
                                    }
                                });
                            }).then(function(result) {
                                if (result && result.count > 0) {
                                    return new Promise(function(resolve, reject) {
                                        return reject(self.getErrorApi().getErrorMsg(1018));
                                    });
                                }
                                employeeJson = mix(employee).into(updateData);
                                return ModelEmployee.update(updateData, {
                                    where: {
                                        id: employee.id,
                                        is_active: true
                                    }
                                });
                            });
                        } else {
                            employeeJson = mix(employee).into(updateData);
                            return ModelEmployee.update(updateData, {
                                where: {
                                    id: employee.id,
                                    is_active: true
                                }
                            });
                        }
                    }
                    return new Promise(function(resolve, reject) {
                        reject({ errNum: 1023, status: 422 });
                    });
                }
                return new Promise(function(resolve, reject) {
                    reject({ errNum: 1029, status: 500 });
                });
            }).then(function(result) {
                if (result) {
                    if (user.employee_id === employeeJson.id) {
                        self._refreshSession(req, employeeJson);
                    }
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

    this.update = function(req, res) {

        var user = self.getUser(req, res);
        var chckData = this._verifyInformation(req.body);
        var empOut = null;
        var updateData = {};

        if (chckData.isCorrupt) {
            this.getErrorApi().sendError(chckData.errNum, 422, res);
            return;
        }

        ModelEmployee.findOne({
            where: {
                id: user.employee_id,
                is_active: true
            }
        }).then(function(result) {
            if (result) {
                var employee = result.dataValues;
                var userData = req.body || null;
                if (!userData) {
                    return new Promise(function(resolve, reject) {
                        reject({ errNum: 1023, status: 422 });
                    });
                }
                for (var x in userData) {
                    if (employee.hasOwnProperty(x) && employee[x] !== userData[x]) {
                        updateData[x] = userData[x];
                    }
                }
                if (updateData.hasOwnProperty('email_address')) {
                    updateData['is_email_confirmed'] = false;
                    return ModelPatron.findAndCountAll({
                        where: {
                            email_address: { $iLike: updateData.email_address },
                            is_active: true
                        }
                    }).then(function(result) {
                        if (result && result.count > 0) {
                            return new Promise(function(resolve, reject) {
                                return reject(self.getErrorApi().getErrorMsg(1018));
                            });
                        }
                        return ModelEmployee.findAndCountAll({
                            where: {
                                email_address: { $iLike: updateData.email_address },
                                is_active: true
                            }
                        });
                    }).then(function(result) {
                        if (result && result.count > 0) {
                            return new Promise(function(resolve, reject) {
                                return reject(self.getErrorApi().getErrorMsg(1018));
                            });
                        }
                        empOut = mix(employee).into(updateData);
                        return ModelEmployee.update(updateData, {
                            where: {
                                id: employee.id,
                                is_active: true
                            }
                        });
                    });
                }

                empOut = mix(employee).into(updateData);
                return ModelEmployee.update(updateData, {
                    where: {
                        id: employee.id,
                        is_active: true
                    }
                });
            } else {
                return new Promise(function(resolve, reject) {
                    reject({ errNum: 1032, status: 500 });
                });
            }
        }).then(function(result) {
            if (result) {
                self._refreshSession(req, empOut);
                res.status(200).json({
                    employee: self._cleanEmployee(empOut),
                    success: true
                });
                return;
            }
            self.getErrorApi().setErrorWithMessage(1033, 422, res);
        }).catch(function(err) {
            if (err.errNum) {
                self.getErrorApi().sendError(err.errNum, err.status, res);
            } else {
                self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
            }
        });
    }

    this.recover = function(req, res) {
        var self = this;
        var moment = getMoment();
        var recoverModel = req.body;
        var hash = getHash();
        var employee = null;
        if (!recoverModel.new_password || recoverModel.new_password === "") {
            this.getErrorApi().sendError(1043, 403, res);
        } else if (!recoverModel.password_confirm || recoverModel.password_confirm === "") {
            this.getErrorApi().sendError(1007, 403, res);
        } else if (recoverModel.password_confirm !== recoverModel.new_password) {
            this.getErrorApi().sendError(1014, 403, res);
        } else if (!this.getModelPattern('password').test(recoverModel.new_password)) {
            this.getErrorApi().sendError(1039, 422, res);
        } else if (!recoverModel.retrieve_token || recoverModel.retrieve_token === "") {
            this.getErrorApi().sendError(1052, 422, res);
        } else {
            getApi('reset').checkPasswordResetToken(recoverModel.retrieve_token, recoverModel.email_address)
                .then(function(result) {
                    var modelType = result.$modelOptions.name.singular;
                    var userModal = null;
                    if (modelType === 'patron_player') {
                        return new Promise(function(resolve, reject) {
                            reject({ errNum: 1054, status: 422 });
                        });
                    } else if (modelType === 'employee_user') {
                        userModal = ModelEmployee;

                    } else {
                        return new Promise(function(resolve, reject) {
                            reject({ errNum: 1024, status: 500 });
                        });
                    }
                    employee = result.dataValues;
                    var updates = {
                        password: hash.generate(recoverModel.new_password),
                        retrieve_expiration: moment().format()
                    }
                    return userModal.update(updates, {
                        where: {
                            id: employee.id
                        }
                    });
                }).then(function(result) {
                    if (result) {
                        res.status(200).json({
                            employee: self._cleanEmployee(employee),
                            success: true
                        });
                    } else {
                        return new Promise(function(resolve, reject) {
                            reject({ errNum: 1033, status: 500 });
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

    this.changePassword = function(req, res) {

        //user should be in the system.
        var user = self.getUser(req, res);
        var reqbody = req.body;
        var employeeOut = null;
        if (!reqbody.new_password || reqbody.new_password === "") {
            this.getErrorApi().sendError(1043, 403, res);
        } else if (!reqbody.old_password || reqbody.old_password === "") {
            this.getErrorApi().sendError(1042, 403, res);
        } else if (!reqbody.password_confirm || reqbody.password_confirm === "") {
            this.getErrorApi().sendError(1007, 403, res);
        } else if (reqbody.password_confirm != reqbody.new_password) {
            this.getErrorApi().sendError(1014, 403, res);
        } else if (!this.getModelPattern('password').test(reqbody.password)) {
            this.getErrorApi().sendError(1039, 422, res);
        } else {
            var hash = getHash();

            ModelEmployee.findOne({
                where: {
                    id: user.employee_id,
                    is_active: true
                }
            }).then(function(result) {
                if (result) {
                    var employee = result.dataValues;
                    employeeOut = result.dataValues;

                    //this code may not be needed.
                    if (employee && employee.password && !hash.isHashed(employee.password)) {
                        employee.password = hash.generate(employee.password);
                    }

                    if (employee && employee.password && !hash.verify(reqbody.old_password, employee.password)) {
                        return new Promise(function(resolve, reject) {
                            reject({ errNum: 1045, status: 422 });
                        });
                    }

                    var passwordWithHash = hash.generate(reqbody.new_password);
                    if (!passwordWithHash) {
                        return new Promise(function(resolve, reject) {
                            reject({ errNum: 1013, status: 422 });
                        });
                    }
                    return ModelEmployee.update({
                        password: passwordWithHash
                    }, {
                        where: {
                            id: employee.id,
                            is_active: true
                        }
                    });
                } else {
                    return new Promise(function(resolve, reject) {
                        reject({ errNum: 1032, status: 500 });
                    });
                }
            }).then(function(result) {
                if (result) {
                    res.status(200).json({
                        employee: self._cleanEmployee(employeeOut),
                        success: true
                    });
                } else {
                    self.getErrorApi().sendError(1033, 500, res);
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

    this.getEmployee = function(req, res) {

        var user = self.getUser(req, res);
        var organization = self.getOrganization(req, res);
        var employee_id = req.query.id || null;
        if (!employee_id) {
            this.getErrorApi().sendError(1031, 400, res);
            return;
        }
        this.retrieve(employee_id)
            .then(function(result) {
                if (result) {
                    var employee = result.dataValues;
                    res.status(200).json({
                        employee: self._cleanEmployee(employee),
                        organization: organization,
                        success: true
                    });
                } else {
                    this.getErrorApi().sendError(1032, 404, res);
                }
            }).catch(function(err) {
                self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
            });
    }

    this.getImage = function(req, res) {
        res.status(200).json({
            success: true
        });
    }

    this.delete = function(req, res) {
        res.status(200).json({
            success: true
        });
    }

    this.postImage = function(req, res) {
        res.status(200).json({
            success: true
        });
    }

    this.updateImage = function(req, res) {
        res.status(200).json({
            success: true
        });
    }
}

module.exports = EmployeeApi;
