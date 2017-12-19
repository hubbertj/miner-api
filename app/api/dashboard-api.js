"use strict";
/*  Title: Dashboard-api
    Author:  Hubbert
    Date: Sep 23 2016
    Comment: 
        This is the api which is used for all dashboard calls.
*/

var TIMESPANS = new Enum(['day', 'week', 'month', 'year', 'max']);

function DashboardApi() {
    var self = this;
    this.tag = 'dashboard-api';

    this.getTimeSpans = function() {
        return TIMESPANS;
    }

    this.getGameChartDate = function(req, res) {
       
        var organization = self.getOrganization(req, res);
        var duration = null;
        var numOfOutput = 7;
        var list = {};
        var model = models.game;

        if (!req.query.duration) {
            this.getErrorApi().sendError(1012, 400, res);
            return;
        } else {
            try {
                duration = TIMESPANS.get(req.query.duration);
                if (!duration) {
                    throw this.getErrorApi().getErrorMsg(1012);
                }
            } catch (err) {
                self.getErrorApi().setErrorWithMessage(err.toString(), 400, res);
                return;
            }
        }

        switch (duration.key) {
            case 'day':
                for (var x = 0; x < numOfOutput; x++) {
                    var d = new Date();
                    var date = d.setHours(d.getHours() - (x * 3.4));
                    list[x] = date;
                }
                _getChart(organization.id, list, numOfOutput, model, res);
                break;

            case 'week':
                for (var x = 0; x < numOfOutput; x++) {
                    var ts = new Date().setDate(new Date().getDate() - x);
                    list[x] = ts;
                }
                _getChart(organization.id, list, numOfOutput, model, res);
                break;

            case 'month':
                for (var x = 0; x < numOfOutput; x++) {
                    var ts = new Date().setDate(new Date().getDate() - (x * 7));
                    list[x] = ts;
                }
                _getChart(organization.id, list, numOfOutput, model, res);
                break;

            case 'year':
                for (var x = 0; x < numOfOutput; x++) {
                    var d = new Date();
                    var date = d.setMonth(d.getMonth() - x);
                    list[x] = date;
                }
                _getChart(organization.id, list, numOfOutput, model, res);
                break;

            case 'max':
                for (var x = 0; x < numOfOutput; x++) {
                    var d = new Date();
                    var date = d.setFullYear(d.getFullYear() - x);
                    list[x] = date;
                }
                _getChart(organization.id, list, numOfOutput, model, res);
                break;

            default:
                this.getErrorApi().sendError(1012, 400, res);
                break;
        }
    }

    this.getPatronChartData = function(req, res) {
       
        var organization = self.getOrganization(req, res);
        var duration = null;
        var numOfOutput = 7;
        var list = {};
        var model = models.patron_player;
        if (!req.query.duration) {
            this.getErrorApi().sendError(1012, 400, res);
            return;
        } else {
            try {
                duration = TIMESPANS.get(req.query.duration);
                if (!duration) {
                    throw this.getErrorApi().getErrorMsg(1012);
                }
            } catch (err) {
                self.getErrorApi().setErrorWithMessage(err.toString(), 400, res);
                return;
            }
        }
        switch (duration.key) {
            case 'day':
                for (var x = 0; x < numOfOutput; x++) {
                    var d = new Date();
                    var date = d.setHours(d.getHours() - (x * 3.4));
                    list[x] = date;
                }
                _getChart(organization.id, list, numOfOutput, model, res);
                break;

            case 'week':
                for (var x = 0; x < numOfOutput; x++) {
                    var ts = new Date().setDate(new Date().getDate() - x);
                    list[x] = ts;
                }
                _getChart(organization.id, list, numOfOutput, model, res);
                break;

            case 'month':
                for (var x = 0; x < numOfOutput; x++) {
                    var ts = new Date().setDate(new Date().getDate() - (x * 7));
                    list[x] = ts;
                }
                _getChart(organization.id, list, numOfOutput, model, res);
                break;

            case 'year':
                for (var x = 0; x < numOfOutput; x++) {
                    var d = new Date();
                    var date = d.setMonth(d.getMonth() - x);
                    list[x] = date;
                }
                _getChart(organization.id, list, numOfOutput, model, res);
                break;

            case 'max':
                for (var x = 0; x < numOfOutput; x++) {
                    var d = new Date();
                    var date = d.setFullYear(d.getFullYear() - x);
                    list[x] = date;
                }
                _getChart(organization.id, list, numOfOutput, model, res);
                break;

            default:
                this.getErrorApi().sendError(1012, 400, res);
                break;
        }
    }

    var _getChart = function(organization_id, list, numOfOutput, Model, res) {
        Model.findAndCountAll({
            where: {
                organization_id: organization_id,
                createdAt: {
                    $lte: new Date(list[0])
                },
                is_active: true
            }
        }).then(function(result) {
            list[0] = {
                date_ts: list[0],
                count: result.count
            }
            return Model.findAndCountAll({
                where: {
                    organization_id: organization_id,
                    createdAt: {
                        $lte: new Date(list[1])
                    },
                    is_active: true
                }
            });
        }).then(function(result) {
            list[1] = {
                date_ts: list[1],
                count: result.count
            }
            return Model.findAndCountAll({
                where: {
                    organization_id: organization_id,
                    createdAt: {
                        $lte: new Date(list[2])
                    },
                    is_active: true
                }
            });
        }).then(function(result) {
            list[2] = {
                date_ts: list[2],
                count: result.count
            }
            return Model.findAndCountAll({
                where: {
                    organization_id: organization_id,
                    createdAt: {
                        $lte: new Date(list[3])
                    },
                    is_active: true
                }
            });
        }).then(function(result) {
            list[3] = {
                date_ts: list[3],
                count: result.count
            }
            return Model.findAndCountAll({
                where: {
                    organization_id: organization_id,
                    createdAt: {
                        $lte: new Date(list[4])
                    },
                    is_active: true
                }
            });
        }).then(function(result) {
            list[4] = {
                date_ts: list[4],
                count: result.count
            }
            return Model.findAndCountAll({
                where: {
                    organization_id: organization_id,
                    createdAt: {
                        $lte: new Date(list[5])
                    },
                    is_active: true
                }
            });
        }).then(function(result) {
            list[5] = {
                date_ts: list[5],
                count: result.count
            }
            return Model.findAndCountAll({
                where: {
                    organization_id: organization_id,
                    createdAt: {
                        $lte: new Date(list[6])
                    },
                    is_active: true
                }
            });
        }).then(function(result) {
            list[6] = {
                date_ts: list[6],
                count: result.count
            }
            res.status(200).json({
                counts: list,
                success: true
            });
        });
    }
}

module.exports = DashboardApi;
