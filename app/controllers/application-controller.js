function AccountController() {
    this.tag = 'accountController';

    this.ApiRouter = {
        organization: function(verb, req, res, self) {
            switch (verb) {
                case 'get':
                    getApi('organization').getOrganizationTypes(req, res);
                    break;
                case 'post':
                    getApi('organization').addOrganizationType(req, res);
                    break;
                case 'put':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'delete':
                    getApi('organization').removeOrganizationType(req, res);
                    break;
                default:
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
            }
        },

        game_type:  function(verb, req, res, self) {
            switch (verb) {
                case 'get':
                    getApi('game').getGameTypes(req, res);
                    break;
                case 'post':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'put':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'delete':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                default:
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
            }
        },
        
        league: function(verb, req, res, self) {
            switch (verb) {
                case 'get':
                    getApi('game').getLeagueTypes(req, res);
                    break;
                case 'post':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'put':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'delete':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                default:
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
            }
        },

        address: function(verb, req, res, self) {
            switch (verb) {
                case 'get':
                    getApi('organization').getAddressTypes(req, res);
                    break;
                case 'post':
                    getApi('organization').addAddressType(req, res);
                    break;
                case 'put':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'delete':
                    getApi('organization').removeAddressType(req, res);
                    break;
                default:
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
            }
        },
        reset: function(verb, req, res, self) {
            switch (verb) {
                case 'get':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'post':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'put':
                    getApi('reset').resetUsernamePassword(req, res);
                    break;
                case 'delete':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                default:
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
            }
        },
        default: function(verb, req, res, self) {
            switch (verb) {
                case 'post':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'get':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'put':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'delete':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                default:
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
            }
        }
    }
}

module.exports = AccountController;
