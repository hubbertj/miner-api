function PatronController() {
    this.tag = 'patronController';

    this.ApiRouter = {
        search: function(verb, req, res, self) {
            switch (verb) {
                case 'post':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'get':
                    getApi('patron').find(req, res);
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

        recover: function(verb, req, res, self) {
            switch (verb) {
                case 'post':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'get':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'put':
                    getApi('patron').recover(req, res);
                    break;
                case 'delete':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                default:
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
            }
        },

        image: function(verb, req, res, self) {
            switch (verb) {
                case 'post':
                    getApi('patron').postImage(req, res);
                    break;
                case 'get':
                    getApi('patron').getImage(req, res);
                    break;
                case 'put':
                    getApi('patron').updateImage(req, res)
                    break;
                case 'delete':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                default:
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
            }
        },
        total: function(verb, req, res, self) {
            switch (verb) {
                case 'post':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'get':
                    getApi('patron').getTotalPatron(req, res);
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

        registration: function(verb, req, res, self) {
            switch (verb) {
                case 'post':
                    getApi('registration').registerPatron(req, res);
                    break;
                case 'get':
                    getApi('registration').getPatronRegistration(req, res);
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

        recover: function(verb, req, res, self) {
            switch (verb) {
                case 'post':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'get':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'put':
                    getApi('patron').recover(req, res);
                    break;
                case 'delete':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                default:
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
            }
        },

        password: function(verb, req, res, self) {
            switch (verb) {
                case 'post':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'get':
                    getApi('patron').getPassword(req, res);
                    break;
                case 'put':
                    getApi('patron').changePassword(req, res);
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
                    getApi('registration').createPatron(req, res);
                    break;
                case 'get':
                    getApi('patron').getPatron(req, res);
                    break;
                case 'put':
                    getApi('patron').update(req, res);
                    break;
                case 'delete':
                    getApi('patron').delete(req, res);
                    break;
                default:
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
            }
        }
    }
}

module.exports = PatronController;
