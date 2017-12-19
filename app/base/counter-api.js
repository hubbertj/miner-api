"use strict";

function baseApi() {
    this.tag = 'counter-api';

    this.getTag = function() {
        return this.name;
    }

    this._cleanAdmin = function(admin) {
        var moment = getMoment();
        return {
            first_name: admin.first_name,
            last_name: admin.last_name,
            id: admin.id,
            username: admin.username,
            createdAt: moment(admin.createdAt).unix(),
            updatedAt: moment(admin.updatedAt).unix()
        }
    }

    this._cleanGame = function(game) {
        var moment = getMoment();
        return {
            id: game.game_id,
            type: game.type,
            league: game.league,
            start: moment(game.start).unix(),
            end: moment(game.end).unix(),
            transaction: null,
            organization_id: 1,
            is_active: true,
            createdAt: moment(game.createdAt).unix(),
            updatedAt: moment(game.updatedAt).unix()
        }
    }

    this._cleanEmployee = function(employee) {
        var moment = getMoment();
        return {
            email_address: employee.email_address,
            first_name: employee.first_name,
            id: employee.id,
            is_admin: employee.is_admin,
            last_name: employee.last_name,
            organization_id: employee.organization_id,
            username: employee.username,
            uuid: employee.e_uuid,
            createdAt: moment(employee.createdAt).unix(),
            updatedAt: moment(employee.updatedAt).unix()
        }
    }

    this._cleanEmployeeInvite = function(model) {
        var moment = getMoment();
        return {
            email_address: model.email_address,
            first_name: moment(model.expire).unix(),
            invite_by: model.invite_by,
            is_admin: model.is_admin,
            organization_id: model.organization_id,
            createdAt: moment(model.createdAt).unix(),
            updatedAt: moment(model.updatedAt).unix()
        }
    }

    this._generateApiKey = function() {
        var uuid = generateUUID().replace(/-/g, "");
        if (uuid) {
            return uuid;
        } else {
            //placeholder uuid;
            return '110E8400E29B11D4A716446655440000';
        }
    }

    this._cleanPatron = function(patron) {
        var moment = getMoment();
        var hasAddress = false;
        var patr = {
            email_address: patron.email_address,
            first_name: patron.first_name,
            id: patron.id,
            is_active: patron.is_active,
            last_name: patron.last_name,
            organization_id: patron.organization_id,
            username: patron.username,
            phone: patron.phone,
            dob: moment(patron.dob).unix(),
            uuid: patron.p_uuid,
            createdAt: moment(patron.createdAt).unix(),
            updatedAt: moment(patron.updatedAt).unix()
        }
        var address = {
            street_number: patron.street_number,
            route: patron.route,
            locality: patron.locality,
            administrative_area_level_1: patron.administrative_area_level_1,
            administrative_area_level_2: patron.administrative_area_level_2,
            country: patron.country,
            postal_code: patron.postal_code,
        }
        for (var x in address) {
            if (address[x]) {
                hasAddress = true;
            }
        }
        if (hasAddress) {
            patr.address = address;
        }
        return patr;
    }

    this._cleanOrganization = function(organization) {
        var moment = getMoment();
        return {
            id: organization.id,
            name: organization.name,
            type: organization.type,
            description: organization.description,
            multi_admin: organization.multi_admin,
            patron_registration_email: organization.patron_registration_email,
            password_expire_time: organization.password_expire_time,
            phone: organization.phone,
            type: organization.type,
            uuid: organization.o_uuid,
            address: organization.address,
            createdAt: moment(organization.createdAt).unix(),
            updatedAt: moment(organization.updatedAt).unix()
        }
    }

    this._refreshSession = function(req, employee) {
        req.session.user = {
            employee_id: employee.id,
            username: employee.username,
            first_name: employee.first_name,
            last_name: employee.last_name,
            email_address: employee.email_address,
            permissions: ['restricted:employee'],
            is_admin: employee.is_admin
        }
        if (employee.is_admin) {
            req.session.user['permissions'] = ['restricted:admin,employee'];
        }
        return true;
    }

    this._refreshAdminSession = function(req, employee) {

        var pArr = ['restricted:superadmin'];
        if (req.session.hasOwnProperty('user')) {
            var permissions = req.session.user.permissions[0];
            permissions = permissions + ',superadmin';
            pArr[0] = permissions;
        } else {
            req.session.user = {
                permissions: pArr
            }
            return true;
        }
        req.session.user.permissions = pArr;
        return true;
    }

    this._refreshSessionOrganization = function(req, organization) {
        req.session.organization = {
            id: organization.id,
            name: organization.name,
            description: organization.description
        }
        return true;
    }

    this.getModelPattern = function(fieldName) {
        switch (fieldName) {
            case "first_name":
                return new RegExp("^[_A-z]{1,}$");
                break;
            case "last_name":
                return new RegExp("^[_A-z]{1,}$");
                break;
            case "password":
                return new RegExp("^.{6,}$");
                break;
            case "phone":
                return new RegExp("[0-9]{11}");
                break;
            default:
                return new RegExp();
                break;
        }
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

    this.getOrganization = function(req, res) {
        var organization = null;
        if (typeof req.session.organization != 'undefined') {
            organization = req.session.organization;
        } else if (typeof res.locals.organization != 'undefined') {
            organization = res.locals.organization;
        }
        return organization;
    }

    this.validEmail = function(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return !re.test(email);
    }

    this.getErrorApi = function() {
        var errorApi = require(GLOBAL.API_DIR + 'error-api');
        return new errorApi();
    }

    this.getModal = function(model) {
        if (model) {
            return GLOBAL.models[model];
        }
        return GLOBAL.models;
    }
}

module.exports = baseApi;
