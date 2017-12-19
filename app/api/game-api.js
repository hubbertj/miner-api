"use strict";
/*  Title: Game-api
    Author:  Hubbert
    Date: Oct 11 2016
    Comment: 
        This is the api which is used for the game section.
*/

function GameApi() {
    var self = this;
    this.tag = 'game-api';
    var Promise = getPromise();
    var ModelGame = models.game;
    var ModelLeagueTypes = models.league_types;
    var ModelGameType = models.game_type;

    this.getTotalGame = function(req, res) {
        var organization = this.getOrganization(req, res);
        ModelGame.findAndCountAll({
            where: {
                organization_id: organization.id
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

    this.create = function(req, res) {
        var user = self.getUser(req, res);
        var organization = self.getOrganization(req, res);
        var postData = req.body;
        var chckData = this._verifyGameCreation(postData);

        console.log(postData);

        // {
        //     salaryCap: 300,
        //     entryFee: 30,
        //     start: '2017-12-12T08:00:00.000Z',
        //     end: '2017-12-12T08:00:00.000Z',
        //     maxPlayers: 100,
        //     minPlayers: 30,
        //     holding: 30,
        //     winners: 3,
        //     multiplier: 0.3,
        //     type: 1,
        //     league: 1
        // }


        //check the information for correctness
        //calculate all the needed data
        //send game creating to create game que to it can be added to game-manager
        //send back json game table row;
        res.status(200).json({
            game: self._cleanGame({}),
            success: true
        });
    }

    this.getGame = function(req, res) {
        var query = req.query;
        var user = self.getUser(req, res);
        var organization = self.getOrganization(req, res);

        if (!query.hasOwnProperty('id')) {
            self.getErrorApi().sendError(1031, 422, res);
            return;
        }

        ModelGame.findOne({
            where: {
                game_id: query.id,
                organization_id: organization.id,
                is_active: true
            }
        }).then(function(result) {
            if (result) {
                var game = result.dataValues;
                res.status(200).json({
                    game: self._cleanGame(game),
                    success: true
                });
            } else {
                self.getErrorApi().sendError(1068, 422, res);
            }
        }).catch(function(err) {
            self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
        });
    }

    this.getGameTypes = function(req, res) {
        ModelGameType.all().then(function(game_types) {
            if (game_types) {
                var g_types = [];
                for (var x in game_types) {
                    var gt = {};
                    gt.id = game_types[x].id;
                    gt.description = game_types[x].description;
                    gt.name = game_types[x].name;
                    g_types.push(gt);
                }
                res.status(200).json({
                    game_types: g_types,
                    success: true
                });
            } else {
                this.getErrorApi().sendError(1067, 500, res);
            }
        });
    }

    this.getLeagueTypes = function(req, res) {
        ModelLeagueTypes.all().then(function(league_types) {
            if (league_types) {
                var leg_types = [];
                for (var x in league_types) {
                    if (!league_types[x].is_active) {
                        continue;
                    }
                    var lt = {};
                    lt.id = league_types[x].id;
                    lt.description = league_types[x].description;
                    lt.name = league_types[x].name;
                    lt.image = league_types[x].image;
                    leg_types.push(lt);
                }
                res.status(200).json({
                    league_types: leg_types,
                    success: true
                });
            } else {
                this.getErrorApi().sendError(1066, 500, res);
            }
        });
    }
    this.find = function(req, res) {
        var moment = getMoment();
        var user = self.getUser(req, res);
        var organization = self.getOrganization(req, res);
        var serachParams = [
            'id',
            'league',
            'start',
            'end',
            'type'
        ]
        var searchObject = {
            start: {
                $gt: moment(0).toDate() //January 1, 1970
            },
            end: {
                $lt: moment().toDate(), //Now
            }
        }
        var games = [];
        var whereSerach = {};
        var searchLimt = 50;

        if (Object.keys(req.query).length === 0) {
            res.status(200).json({
                games: games,
                success: true
            });
        }

        for (var x in req.query) {
            if (serachParams.indexOf(x) > -1 && req.query[x] != '' && req.query[x] != null) {
                if (x === 'start') {
                    searchObject[x].$gt = moment(req.query[x]).toDate();
                } else if (x === 'end') {
                    searchObject[x].$lt = moment(req.query[x]).toDate();
                } else {
                    searchObject[x] = req.query[x];
                }
            }
        }

        // if we have game id we dont search the other stuff;
        if (searchObject.hasOwnProperty('id')) {
            ModelGame.findOne({
                where: {
                    game_id: searchObject.id,
                    organization_id: organization.id,
                }
            }).then(function(result) {
                if (result) {
                    games.push(self._cleanGame(result.dataValues));
                }
                res.status(200).json({
                    games: games,
                    success: true
                });
            }).catch(function(err) {
                self.getErrorApi().sendError(1068, 500, res);
                // self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
            });
            return;
        }

        searchObject.organization_id = organization.id;

        ModelGame.findAll({
            where: searchObject,
            limit: searchLimt
        }).then(function(results) {
            if (results) {
                for (var x in results) {
                    games.push(self._cleanGame(results[x].dataValues));
                }
            }
            res.status(200).json({
                games: games,
                success: true
            });
        }).catch(function(err) {
            self.getErrorApi().setErrorWithMessage(err.toString(), 500, res);
        });
    }

    this._verifyGameCreation = function(game) {

        // {
        //     salaryCap: 300,
        //     entryFee: 30,
        //     start: '2017-12-12T08:00:00.000Z',
        //     end: '2017-12-12T08:00:00.000Z',
        //     maxPlayers: 100,
        //     minPlayers: 30,
        //     holding: 30,
        //     winners: 3,
        //     multiplier: 0.3,
        //     type: 1,
        //     league: 1
        // }


        // needs to verify salary cap is a number and is not set needs to be 0
        // verify entryfee is a amount.
        //verify start date is in the future and is a date string.
        // verify end date is in the future and after start date.
        // etc..


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
}

module.exports = GameApi;
