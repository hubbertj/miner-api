"use strict";
/*  Title: Login-Api
    Author:  Hubbert
    Date: Dec 05 2016
    Comment: 
        This is the api which is used login for employees and admins.
*/

function LoginApi() {
    var self = this;
    this.tag = 'login-api';
    var Promise = getPromise();
    var Employee = models.employee_user;
    var Organization = models.organization;
    var AdminModel = models.admin_user;

    this.loginPatron = function(req, email_address) {

        return new Promise(function(resolve, reject) {});
    }

    this.loginAdmin = function(req, res) {
        var loginModel = req.body;
        AdminModel.findOne({
            where: {
                username: { $iLike: loginModel.username },
                is_active: true
            }
        }).then(function(result) {
            if (result) {
                var admin = result.dataValues;
                self._refreshAdminSession(req, admin);
                res.status(200).json({
                    admin: self._cleanAdmin(admin),
                    success: true
                });
                return;
            }
            self.getErrorApi().sendError(9906, 401, res);
        }).catch(function(err) {
            if (err.errNum) {
                self.getErrorApi().sendError(err.errNum, err.status, res);
            } else {
                self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
            }
        });
    }

    this.loginUser = function(req, email_address) {
        var fEmployee = null;
        return new Promise(function(resolve, reject) {
            Employee.findOne({
                where: {
                    email_address: { $iLike: email_address },
                    is_active: true
                }
            }).then(function(employee) {
                if (employee) {
                    self._refreshSession(req, employee);
                    fEmployee = employee;
                    return Organization.findOne({
                        where: {
                            id: employee.organization_id,
                            is_active: true
                        }
                    });
                } else {
                    return new Promise(function(resolve, reject) {
                        reject({ errNum: 9903, status: 404 });
                    });
                }
            }).then(function(organization) {
                if (organization && fEmployee) {
                    self._refreshSessionOrganization(req, organization);
                    resolve(fEmployee);
                } else {
                    reject(self.getErrorApi().getErrorMsg(1028));
                }
            }).catch(function(err) {
                if (err.errNum) {
                    reject(self.getErrorApi().getErrorMsg(err.errNum));
                } else {
                    reject(err);
                }
            });
        });
    }

    this.login = function(req, res) {

        var fEmployee = null;
        if (!req.body.email_address) {
            this.getErrorApi().sendError(1001, 403, res);
        } else if (!req.body.password) {
            this.getErrorApi().sendError(1001, 403, res);
        } else {
            // search for attributes
            Employee.findOne({
                where: {
                    email_address: { $iLike: req.body.email_address },
                    is_active: true
                }
            }).then(function(employee) {
                var hash = getHash();

                //this code may not be needed.
                if (employee && employee.password && !hash.isHashed(employee.password)) {
                    employee.password = hash.generate(employee.password);
                }

                if (employee && hash.verify(req.body.password, employee.password)) {
                    self._refreshSession(req, employee);
                    fEmployee = {
                        employee_id: employee.id,
                        username: employee.username,
                        first_name: employee.first_name,
                        last_name: employee.last_name,
                        email_address: employee.email_address,
                        is_admin: employee.is_admin
                    }

                    return Organization.findOne({
                        where: {
                            id: employee.organization_id,
                            is_active: true
                        }
                    });

                } else if (!employee) {
                    return new Promise(function(resolve, reject) {
                        reject({ errNum: 1002, status: 401 });
                    });
                } else {
                    return new Promise(function(resolve, reject) {
                        reject({ errNum: 1001, status: 401 });
                    });
                }

            }).then(function(organization) {
                if (organization) {
                    self._refreshSessionOrganization(req, organization);
                    res.json({
                        user: fEmployee,
                        success: true
                    });
                } else {
                    self.getErrorApi().sendError(1028, 422, res);
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

    this.getLogin = function(req, res) {
        if (req.session.user) {
            res.status = 200;
            res.json({
                user: req.session.user,
                success: true
            });
        } else {
            res.status = 400;
            res.json({
                message: 'User not logged in.',
                success: false
            });
        }
    }
}

module.exports = LoginApi;
