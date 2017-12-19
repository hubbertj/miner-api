"use strict";
/*  Title: Patron-api
    Author:  Hubbert
    Date: Sep 28 2016
    Comment: 
        This is the api which is used for all patron search and create logic.
*/
function PatronApi() {
    var self = this;
    this.tag = 'patron-api';
    var Promise = getPromise();
    var ModelPatron = models.patron_player;
    var ModelEmployee = models.employee_user;


    this.retrieve = function(patron_id) {
        return ModelPatron.findOne({
            where: {
                id: patron_id,
                is_active: true
            }
        });
    }

    this.recover = function(req, res) {
        var self = this;
        var moment = getMoment();
        var recoverModel = req.body;
        var hash = getHash();
        var patron = null;
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
                        userModal = ModelPatron;
                    } else if (modelType === 'employee_user') {
                        return new Promise(function(resolve, reject) {
                            reject({ errNum: 1053, status: 422 });
                        });
                    } else {
                        return new Promise(function(resolve, reject) {
                            reject({ errNum: 1024, status: 500 });
                        });
                    }
                    patron = result.dataValues;
                    var updates = {
                        password: hash.generate(recoverModel.new_password),
                        retrieve_expiration: moment().format()
                    }
                    return userModal.update(updates, {
                        where: {
                            id: patron.id
                        }
                    });
                }).then(function(result) {
                    if (result) {
                        res.status(200).json({
                            patron: self._cleanPatron(patron),
                            success: true
                        });
                    } else {
                        return new Promise(function(resolve, reject) {
                            reject({ errNum: 1048, status: 500 });
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

    this.update = function(req, res) {
        var moment = getMoment();
        var user = self.getUser(req, res);
        var organization = self.getOrganization(req, res);
        var patronIn = req.body;
        var chckData = this._verifyInformation(patronIn);
        var patronOut = null;
        var minAge = 18;

        if (!patronIn.hasOwnProperty('id')) {
            self.getErrorApi().sendError(1049, 422, res);
            return;
        }
        if (chckData.isCorrupt) {
            self.getErrorApi().sendError(chckData.errNum, 422, res);
            return;
        }
        if (patronIn.hasOwnProperty('dob')) {
            var eightYearsAgo = moment().subtract("years", minAge);
            var birthday = moment(patronIn.dob);
            if (!eightYearsAgo.isAfter(birthday)) {
                self.getErrorApi().sendError(1047, 422, res);
                return;
            }
        }

        ModelEmployee.findOne({
            where: {
                id: user.employee_id,
                is_active: true
            }
        }).then(function(result) {
            if (result) {
                var employee = result.dataValues;
                if (employee.is_admin) {
                    return ModelPatron.findOne({
                        where: {
                            id: patronIn.id,
                            organization_id: organization.id,
                            is_active: true
                        }
                    });
                }
                return new Promise(function(resolve, reject) {
                    reject({ errNum: 1050, status: 401 });
                });
            }
            return new Promise(function(resolve, reject) {
                reject({ errNum: 1032, status: 500 });
            });
        }).then(function(result) {
            if (result) {
                var fPatron = result.dataValues;
                var updateData = {};
                var updates = {};
                var userData = patronIn || null;

                if (userData) {
                    for (var x in userData) {
                        if (fPatron.hasOwnProperty(x) && fPatron[x] !== userData[x]) {
                            if (x === 'dob') {
                                var new_dob = moment(fPatron[x]);
                                var old_dob = moment(userData[x]);
                                if (new_dob.diff(old_dob) === 0) {
                                    continue;
                                }
                            }
                            updateData[x] = userData[x];
                            updates[x] = userData[x];
                        }
                    }
                } else {
                    return new Promise(function(resolve, reject) {
                        reject({ errNum: 1012, status: 422 });
                    });
                }
                patronOut = mix(fPatron).into(updateData);

                //check for email is already in system.
                if (updates.hasOwnProperty('email_address')) {
                    return ModelPatron.findAndCountAll({
                        where: {
                            email_address: { $iLike: patronIn.email_address },
                            is_active: true
                        }
                    }).then(function(results) {
                        if (results.count > 0) {
                            return new Promise(function(resolve, reject) {
                                return reject(self.getErrorApi().getErrorMsg(1018));
                            });
                        }
                        return ModelEmployee.findAndCountAll({
                            where: {
                                email_address: { $iLike: patronIn.email_address },
                                is_active: true
                            }
                        });
                    }).then(function(results) {
                        if (results.count > 0) {
                            return new Promise(function(resolve, reject) {
                                return reject(self.getErrorApi().getErrorMsg(1018));
                            });
                        }
                        return ModelPatron.update(updates, {
                            where: {
                                id: fPatron.id,
                                organization_id: organization.id,
                                is_active: true
                            }
                        });
                    }).catch(function(err) {
                        return new Promise(function(resolve, reject) {
                            return reject(err);
                        });
                    });
                } else {
                    return ModelPatron.update(updates, {
                        where: {
                            id: fPatron.id,
                            organization_id: organization.id,
                            is_active: true
                        }
                    });
                }
            } else {
                return new Promise(function(resolve, reject) {
                    reject({ errNum: 1041, status: 422 });
                });
            }
        }).then(function(result) {
            if (result) {
                res.status(200).json({
                    patron: self._cleanPatron(patronOut),
                    success: true
                });
            } else {
                self.getErrorApi().setErrorWithMessage(1048, 500, res);
            }
        }).catch(function(err) {
            if (err.errNum) {
                self.getErrorApi().sendError(err.errNum, err.status, res);
            } else {
                self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
            }
        });
    }

    this.getPatron = function(req, res) {
        var query = req.query;
        var user = self.getUser(req, res);
        var organization = self.getOrganization(req, res);

        if (!query.hasOwnProperty('id')) {
            self.getErrorApi().sendError(1031, 422, res);
            return;
        }
        ModelPatron.findOne({
            where: {
                id: query.id,
                organization_id: organization.id,
                is_active: true
            }
        }).then(function(result) {
            if (result) {
                var patron = result.dataValues;
                res.status(200).json({
                    patron: self._cleanPatron(patron),
                    success: true
                });
            } else {
                self.getErrorApi().sendError(1041, 422, res);
            }
        }).catch(function(err) {
            self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
        });
    }

    this.changePassword = function(req, res) {

        //user should be in the system.
        var user = self.getUser(req, res);
        var reqbody = req.body;
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
                    var employee = result.dataValues;
                    res.status(200).json({
                        employee: self._cleanEmployee(employee),
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

    this.getImage = function(req, res) {
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

    this.delete = function(req, res) {
        var user = self.getUser(req, res);
        var organization = self.getOrganization(req, res);
        var patron = req.query || null;
        var pOut = null;
        if (!patron || !patron.hasOwnProperty('id') || !patron.id) {
            self.getErrorApi().sendError(1031, 422, res);
            return
        }
        ModelEmployee.findOne({
            where: {
                id: user.employee_id,
                is_active: true
            }
        }).then(function(result) {
            if (result) {
                var employee = result.dataValues;
                if (employee.is_admin) {
                    return ModelPatron.findOne({
                        where: {
                            id: patron.id,
                            organization_id: organization.id,
                            is_active: true
                        }
                    });
                }
                return new Promise(function(resolve, reject) {
                    reject({ errNum: 1050, status: 401 });
                });
            }
            return new Promise(function(resolve, reject) {
                reject({ errNum: 1032, status: 500 });
            });
        }).then(function(result) {
            if (result) {
                pOut = result.dataValues;
                return ModelPatron.update({ is_active: false }, {
                    where: {
                        id: pOut.id
                    }
                });
            } else {
                return new Promise(function(resolve, reject) {
                    reject({ errNum: 1041, status: 401 });
                });
            }
        }).then(function(result) {
            if (result) {
                var patron = self._cleanPatron(pOut);
                patron.is_active = false;
                res.status(200).json({
                    patron: patron,
                    success: true
                });
            } else {
                return new Promise(function(resolve, reject) {
                    reject({ errNum: 1048, status: 500 });
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

    this.userChangePassword = function(req, res) {
        var params = req.body;
        console.log(params)
        res.status(200).json({
            patron: params,
            success: true
        });
    }

    this.find = function(req, res) {

        var user = self.getUser(req, res);
        var organization = self.getOrganization(req, res);
        var serachParams = [
            'email_address',
            'first_name',
            'last_name',
            'patron_id'
        ];
        var searchObject = {};
        var patrons = [];
        var whereSerach = {};
        var searchLimt = 50;

        if (Object.keys(req.query).length === 0) {
            res.status(200).json({
                patrons: patrons,
                success: true
            });
        }
        for (var x in req.query) {
            if (serachParams.indexOf(x) > -1 && req.query[x] != '' && req.query[x] != null) {
                searchObject[x] = req.query[x];
            }
        }
        // if we have patron_id we dont search the other stuff;
        if (searchObject.hasOwnProperty('patron_id')) {
            ModelPatron.find({
                where: {
                    id: searchObject.patron_id,
                    organization_id: organization.id,
                    is_active: true
                }
            }).then(function(results) {
                if (results) {
                    patrons.push(self._cleanPatron(results.dataValues));
                }
                res.status(200).json({
                    patrons: patrons,
                    success: true
                });
            }).catch(function(err) {
                self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
            });
            return;
        }

        //add where search for pg only;
        for (var x in searchObject) {
            whereSerach[x] = {
                $iLike: '%' + searchObject[x] + '%'
            }
        }
        whereSerach.organization_id = organization.id;
        whereSerach.is_active = true;

        ModelPatron.findAll({
            where: whereSerach,
            limit: searchLimt
        }).then(function(results) {
            if (results) {
                for (var x in results) {
                    patrons.push(self._cleanPatron(results[x].dataValues));
                }
            }
            res.status(200).json({
                patrons: patrons,
                success: true
            });
        }).catch(function(err) {
            self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
        });
    }

    this.getTotalPatron = function(req, res) {

        var organization = self.getOrganization(req, res);

        ModelPatron.findAndCountAll({
            where: {
                organization_id: organization.id,
                is_active: true
            }
        }).then(function(results) {
            res.status(200).json({
                total: results.count,
                success: true
            });
        }).catch(function(err) {
            self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
        });
    }

    this._verifyInformation = function(patron) {
        var moment = getMoment();
        var errorNumber = null;
        if (patron.hasOwnProperty('first_name') &&
            !this.getModelPattern('first_name').test(patron.first_name)) {
            errorNumber = 1035;
        }
        if (patron.hasOwnProperty('last_name') &&
            !this.getModelPattern('last_name').test(patron.first_name)) {
            errorNumber = 1036;
        }
        if (patron.hasOwnProperty('username') &&
            this.validEmail(patron.username)) {
            errorNumber = 1037;
        }
        if (patron.hasOwnProperty('email_address') &&
            this.validEmail(patron.email_address)) {
            errorNumber = 1038;
        }
        if (patron.hasOwnProperty('phone') &&
            patron.phone &&
            !this.getModelPattern('phone').test(patron.phone)) {
            errorNumber = 1046;
        }
        if (patron.hasOwnProperty('dob') &&
            !moment(patron.dob, moment.ISO_8601).isValid()) {
            errorNumber = 1046;
        }
        if (patron.hasOwnProperty('password')) {
            errorNumber = 1034;
        }
        if (patron.hasOwnProperty('organization_id')) {
            errorNumber = 1034;
        }
        if (patron.hasOwnProperty('p_uuid')) {
            errorNumber = 1034;
        }
        if (patron.hasOwnProperty('createdAt')) {
            errorNumber = 1034;
        }
        if (patron.hasOwnProperty('updatedAt')) {
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
}

module.exports = PatronApi;
