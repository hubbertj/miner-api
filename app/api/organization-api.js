"use strict";
/*  Title: Organization-Api
    Author:  Hubbert
    Date: Oct 07 2016
    Comment: 
        This is the api which is used for all organization calls / managment.
*/

function OrganizationApi() {
    var self = this;
    this.tag = 'organization-api';
    var Promise = getPromise();
    var ModelOrganization = models.organization;
    var ModelEmployeeInvite = models.employee_invite;
    var ModelEmployee = models.employee_user;
    var ModelPatron = models.patron_player;
    var ModelOrganizationAddress = models.organization_address;
    var Organization_types = models.organization_type;
    var Address_type = models.address_type;

    this.getSettings = function(id) {
        return new Promise(function(resolve, reject) {
            ModelOrganization.findOne({
                where: {
                    id: id,
                    is_active: true
                }
            }).then(function(result) {
                if (result) {
                    var o = result.dataValues;
                    var settings = {
                        uuid: o.o_uuid,
                        api_key: o.api_key,
                        patron_registration_email: o.patron_registration_email,
                        password_expire_time: o.password_expire_time,
                        multi_admin: o.multi_admin
                    }
                    return resolve(settings);
                } else {
                    return reject('Organization not found!');
                }
            }).catch(function(err) {
                return reject(err);
            });
        });
    }

    this.addOrganizationType = function(req, res) {
        var user = self.getUser(req, res);
        var organization = self.getOrganization(req, res);
        var postData = req.body;

        if (!postData.admin) {
            self.getErrorApi().sendError(1050, 401, res);
            return;
        } else if (!postData.hasOwnProperty('name') && !postData.name) {
            self.getErrorApi().sendError(1012, 422, res);
            return;
        } else if (!postData.hasOwnProperty('description') && !postData.description) {
            self.getErrorApi().sendError(1012, 422, res);
            return;
        }
        Organization_types.create({
            name: postData.name,
            description: postData.description
        }).then(function(result) {
            if (result) {
                var organization_type = result.dataValues;
                res.status(200).json({
                    organization_type: organization_type,
                    success: true
                });
                return;
            }
            self.getErrorApi().sendError(1050, 401, res);
        }).catch(function(err) {
            self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
        });
    }
    this.addAddressType = function(req, res) {
        var user = self.getUser(req, res);
        var organization = self.getOrganization(req, res);
        var postData = req.body;

        if (!postData.admin) {
            self.getErrorApi().sendError(1050, 401, res);
            return;
        } else if (!postData.hasOwnProperty('name') && !postData.name) {
            self.getErrorApi().sendError(1012, 422, res);
            return;
        } else if (!postData.hasOwnProperty('description') && !postData.description) {
            self.getErrorApi().sendError(1012, 422, res);
            return;
        }
        Address_type.create({
            name: postData.name,
            description: postData.description
        }).then(function(result) {
            if (result) {
                var address_type = result.dataValues;
                res.status(200).json({
                    address_type: address_type,
                    success: true
                });
                return;
            }
            self.getErrorApi().sendError(1050, 401, res);
        }).catch(function(err) {
            self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
        });
    }

    this.removeOrganizationType = function(req, res) {
        var user = self.getUser(req, res);
        var organization = self.getOrganization(req, res);
        var deleteData = req.query;

        if (!deleteData.admin) {
            self.getErrorApi().sendError(1050, 401, res);
            return;
        } else if (!deleteData.hasOwnProperty('id') && !postData.id) {
            self.getErrorApi().sendError(1012, 422, res);
            return;
        }

        Organization_types.destroy({
            where: {
                id: deleteData.id
            }
        }).then(function(result) {
            if (result) {
                res.status(200).json({
                    success: true
                });
            }else{
                self.getErrorApi().sendError(9907, 401, res);
            }
        }).catch(function(err) {
            self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
        });
    }

    this.removeAddressType = function(req, res) {
        var user = self.getUser(req, res);
        var organization = self.getOrganization(req, res);
        var deleteData = req.query;

        if (!deleteData.admin) {
            self.getErrorApi().sendError(1050, 401, res);
            return;
        } else if (!deleteData.hasOwnProperty('id') && !postData.id) {
            self.getErrorApi().sendError(1012, 422, res);
            return;
        }

        Address_type.destroy({
            where: {
                id: deleteData.id
            }
        }).then(function(result) {
            if (result) {
                res.status(200).json({
                    success: true
                });
            }else{
                self.getErrorApi().sendError(9907, 401, res);
            }
        }).catch(function(err) {
            self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
        });
    }

    this.getAdministrators = function(id) {
        return ModelEmployee.findAll({
            where: {
                organization_id: id,
                is_active: true,
                is_admin: true
            }
        });
    }

    this.getOrganizationTypes = function(req, res) {

        Organization_types.all().then(function(organization_types) {
            if (organization_types) {
                var org_types = [];
                for (var x in organization_types) {
                    var ot = {};
                    ot.id = organization_types[x].id;
                    ot.description = organization_types[x].description;
                    ot.name = organization_types[x].name;
                    org_types.push(ot);
                }
                res.status(200).json({
                    organization_types: org_types,
                    success: true
                });
            } else {
                this.getErrorApi().sendError(1009, 500, res);
            }
        });
    }

    this.getAddressTypes = function(req, res) {

        Address_type.all().then(function(address_types) {
            if (address_types) {
                var addre_types = [];
                for (var x in address_types) {
                    var at = {};
                    at.id = address_types[x].id;
                    at.description = address_types[x].description;
                    at.name = address_types[x].name;
                    addre_types.push(at);
                }
                res.status(200).json({
                    address_types: addre_types,
                    success: true
                });
            } else {
                this.getErrorApi().sendError(1065, 500, res);
            }
        });
    }

    this.retrieve = function(organization_id) {
        return ModelOrganization.find({
            where: {
                id: organization_id,
                is_active: true
            }
        });
    }

    this.retrieve_employees = function(req, res) {
            var user = self.getUser(req, res);
            var organization = self.getOrganization(req, res);
            var limit = 50;
            ModelEmployee.findAll({
                where: {
                    is_active: true,
                    organization_id: organization.id
                },
                limit: limit
            }).then(function(results) {
                if (results) {
                    var employees = [];
                    for (var x in results) {
                        employees.push(self._cleanEmployee(results[x].dataValues));
                    }
                    res.status(200).json({
                        employees: employees,
                        success: true
                    });
                    return;
                }
                self.getErrorApi().sendError(1059, 422, res);
            }).catch(function(err) {
                self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
            });
        },

        this.retrieve_patrons = function(req, res) {
            var user = self.getUser(req, res);
            var organization = self.getOrganization(req, res);
            var limit = 50;
            ModelPatron.findAll({
                where: {
                    is_active: true,
                    organization_id: organization.id
                },
                limit: limit
            }).then(function(results) {
                if (results) {
                    var patrons = [];
                    for (var x in results) {
                        patrons.push(self._cleanPatron(results[x].dataValues));
                    }
                    res.status(200).json({
                        patrons: patrons,
                        success: true
                    });
                    return;
                }
                self.getErrorApi().sendError(1060, 422, res);
            }).catch(function(err) {
                self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
            });
        }

    this.create = function(organization) {
        var self = this;
        return ModelOrganization.create(organization);
    }

    this.post_create = function(req, res) {
        var self = this;
        res.status(200).json({
            organization: null,
            success: true
        });
    }

    this.get_organization = function(req, res) {
        var query = req.query;
        var user = self.getUser(req, res);
        var organization = self.getOrganization(req, res);
        var organizationJson = null;

        ModelOrganization.findOne({
            where: {
                id: organization.id,
                is_active: true
            }
        }).then(function(result) {
            if (result) {
                organizationJson = result.dataValues;

                return ModelOrganizationAddress.findAll({
                    where: {
                        organization_id: organizationJson.id,
                        is_active: true
                    }
                });
            }
            return new Promise(function(resolve, reject) {
                reject({ errNum: 1030, status: 422 });
            });
        }).then(function(result) {
            var address = [];
            if (result) {
                for (var x in result) {
                    address.push(result[x]);
                }
            }
            organizationJson.address = address;
            res.status(200).json({
                organization: self._cleanOrganization(organizationJson),
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
    this.remove_address = function(req, res) {
        var user = self.getUser(req, res);
        var sessOrganization = self.getOrganization(req, res);
        var address = req.query || null;

        if (!address.hasOwnProperty('id')) {
            self.getErrorApi().sendError(1031, 422, res);
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
                if (!employee.is_admin) {
                    return new Promise(function(resolve, reject) {
                        reject({ errNum: 1050, status: 401 });
                    });
                }
                return ModelOrganizationAddress.update({ is_active: false }, {
                    where: {
                        id: address.id,
                        organization_id: employee.organization_id,
                        is_active: true
                    }
                });
            }
            return new Promise(function(resolve, reject) {
                reject({ errNum: 1064, status: 500 });
            });
        }).then(function(result) {
            if (result) {
                res.status(200).json({
                    success: true
                });
                return;
            }
            self.getErrorApi().sendError(1063, 500, res);
        }).catch(function(err) {
            if (err.errNum) {
                self.getErrorApi().sendError(err.errNum, err.status, res);
            } else {
                self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
            }
        });
    }

    this.add_address = function(req, res) {
        var user = self.getUser(req, res);
        var sessOrganization = self.getOrganization(req, res);
        var postData = req.body;
        ModelEmployee.findOne({
            where: {
                id: user.employee_id,
                is_active: true
            }
        }).then(function(result) {
            if (result) {
                var employee = result.dataValues;
                if (!employee.is_admin) {
                    return new Promise(function(resolve, reject) {
                        reject({ errNum: 1050, status: 401 });
                    });
                }
                return ModelOrganizationAddress.create({
                    organization_id: employee.organization_id,
                    name: postData.name,
                    type: postData.type,
                    street_number: postData.street_number,
                    route: postData.route,
                    locality: postData.locality,
                    administrative_area_level_1: postData.administrative_area_level_1,
                    administrative_area_level_2: postData.administrative_area_level_2,
                    country: postData.country,
                    postal_code: postData.postal_code
                });
            }
            return new Promise(function(resolve, reject) {
                reject({ errNum: 1029, status: 500 });
            });
        }).then(function(result) {
            if (result) {
                var address = result.dataValues;
                res.status(200).json({
                    address: address,
                    success: true
                });
                return;
            }
            self.getErrorApi().sendError(1063, 500, res);
        }).catch(function(err) {
            if (err.errNum) {
                self.getErrorApi().sendError(err.errNum, err.status, res);
            } else {
                self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
            }
        });
    }

    this.put_update = function(req, res) {
        var self = this;
        var user = self.getUser(req, res);
        var sessOrganization = self.getOrganization(req, res);
        var putData = req.body;
        var organizationJson = null;
        var chckData = this._verifyInformationOrganization(putData);

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
                if (employee.is_admin) {
                    return ModelOrganization.findOne({
                        where: {
                            id: sessOrganization.id,
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
                var organization = result.dataValues;
                var updates = {};
                var tmpUpdates = {};
                for (var attr in putData) {
                    if (organization.hasOwnProperty(attr) && organization[attr] != putData[attr]) {
                        updates[attr] = putData[attr];
                        tmpUpdates[attr] = putData[attr];
                    }
                }
                if (updates.hasOwnProperty('multi_admin') && !updates.multi_admin) {
                    ModelEmployee.update({ is_admin: false }, {
                        where: {
                            organization_id: organization.id,
                            id: {
                                $ne: user.employee_id
                            },
                            is_active: true
                        }
                    });
                }
                organizationJson = mix(result.dataValues).into(tmpUpdates);
                return ModelOrganization.update(updates, {
                    where: {
                        id: organization.id,
                        is_active: true
                    }
                });
            } else {
                return new Promise(function(resolve, reject) {
                    reject({ errNum: 1030, status: 500 });
                });
            }
        }).then(function(didUpdate) {
            if (didUpdate && organizationJson) {
                self._refreshSessionOrganization(req, organizationJson);
                res.status(200).json({
                    organization: self._cleanOrganization(organizationJson),
                    success: true
                });
            } else {
                self.getErrorApi().setErrorWithMessage(1055, 500, res);
            }
        }).catch(function(err) {
            if (err.errNum) {
                self.getErrorApi().sendError(err.errNum, err.status, res);
            } else {
                self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
            }
        });
    }

    this._verifyInformationOrganization = function(organization) {
        var errorNumber = null;
        var isCorrupt = false;

        if (organization.hasOwnProperty('id') || organization.hasOwnProperty('createdAt') ||
            organization.hasOwnProperty('updatedAt') || organization.hasOwnProperty('is_active') ||
            organization.hasOwnProperty('o_uuid') || organization.hasOwnProperty('api_key')) {
            errorNumber = 1034;
        }
        if (organization.hasOwnProperty('phone') &&
            organization.phone &&
            !this.getModelPattern('phone').test(organization.phone)) {
            errorNumber = 1046;
        }
        if (errorNumber) {
            isCorrupt = true;
        }
        return {
            errNum: errorNumber,
            isCorrupt: isCorrupt
        }
    }
    this._verifyInformationInvite = function(invite) {
        var errorNumber = null;
        var isCorrupt = false;

        if (invite.hasOwnProperty('email_address') &&
            this.validEmail(invite.email_address)) {
            errorNumber = 1038;
        }
        if (!invite.hasOwnProperty('is_admin')) {
            errorNumber = 1012;
        }

        if (errorNumber) {
            isCorrupt = true;
        }
        return {
            errNum: errorNumber,
            isCorrupt: isCorrupt
        }
    }

    this.invitation = function(req, res) {
        var moment = getMoment();
        var user = self.getUser(req, res);
        var sessOrganization = self.getOrganization(req, res);
        var postData = req.body;
        var chckData = this._verifyInformationInvite(postData);
        var defaultExpire = moment().add(30, 'days');
        var db_organization = null;
        var db_employeeInvite = null;

        if (chckData.isCorrupt) {
            this.getErrorApi().sendError(chckData.errNum, 422, res);
            return;
        }

        var hash = getHash();

        var code = self._generateApiKey();
        var codeWithHash = hash.generate(code);

        ModelPatron.findAndCountAll({
            where: {
                email_address: { $iLike: postData.email_address },
                is_active: true
            }
        }).then(function(results) {
            if (results.count > 0) {
                return new Promise(function(resolve, reject) {
                    reject({ errNum: 1018, status: 422 });
                });
            }

            return ModelEmployee.findAndCountAll({
                where: {
                    email_address: { $iLike: postData.email_address },
                    is_active: true
                }
            });
        }).then(function(results) {
            if (results.count > 0) {
                return new Promise(function(resolve, reject) {
                    reject({ errNum: 1018, status: 422 });
                });
            }
            //we check this just in case the organization has been deleted.
            return ModelOrganization.findOne({
                where: {
                    id: sessOrganization.id,
                    is_active: true
                }

            });
        }).then(function(result) {
            if (result) {
                db_organization = result.dataValues;
                return ModelEmployeeInvite.findOne({
                    where: {
                        email_address: { $iLike: postData.email_address },
                        is_active: true
                    }
                });
            } else {
                return new Promise(function(resolve, reject) {
                    reject({ errNum: 1029, status: 422 });
                });
            }
        }).then(function(result) {
            if (result) {
                var updates = {
                    code: codeWithHash,
                    invite_by: user.employee_id,
                    organization_id: db_organization.id,
                    email_address: postData.email_address,
                    expire: defaultExpire.toDate(),
                    is_admin: postData.is_admin
                }

                db_employeeInvite = mix(result.dataValues).into({
                    code: codeWithHash,
                    invite_by: user.employee_id,
                    organization_id: db_organization.id,
                    email_address: postData.email_address,
                    expire: defaultExpire.toDate(),
                    is_admin: postData.is_admin
                });

                return ModelEmployeeInvite.update(updates, {
                    where: {
                        id: db_employeeInvite.id
                    }
                });
            } else {
                return ModelEmployeeInvite.create({
                    code: codeWithHash,
                    invite_by: user.employee_id,
                    organization_id: db_organization.id,
                    email_address: postData.email_address,
                    expire: defaultExpire.toDate(),
                    is_admin: postData.is_admin,
                    is_active: true
                });
            }
        }).then(function(result) {
            if (result.hasOwnProperty('dataValues')) {
                var employeeInvite = result.dataValues;
                getApi('email').inviteUser(employeeInvite.email_address, db_organization, code);
                res.status(200).json({
                    employeeInvite: employeeInvite,
                    success: true
                });
            } else if (result) {
                getApi('email').inviteUser(postData.email_address, db_organization, code);
                res.status(200).json({
                    employeeInvite: self._cleanEmployeeInvite(db_employeeInvite),
                    success: true
                });
            } else {
                self.getErrorApi().sendError(1056, 500, res);
            }
        }).catch(function(err) {
            if (err.errNum) {
                self.getErrorApi().sendError(err.errNum, err.status, res);
            } else {
                self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
            }
        });
    }

    this.getAllInvitation = function(req, res) {
        res.status(200).json({
            success: true
        });
    }

    this.cancelInvitation = function(req, res) {
        res.status(200).json({
            success: true
        });
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
}

module.exports = OrganizationApi;
