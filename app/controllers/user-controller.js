function UserController() {
    this.tag = 'userController';

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

        patron_password: function(verb, req, res, self) {
            switch (verb) {
                case 'post':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'get':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'put':
                    getApi('patron').userChangePassword(req, res);
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
                    getApi('employee').recover(req, res);
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
                    getApi('employee').getPassword(req, res);
                    break;
                case 'put':
                    getApi('employee').changePassword(req, res);
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

        default: function(verb, req, res, self) {
            switch (verb) {
                case 'post':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'get':
                    getApi('employee').getEmployee(req, res);
                    break;
                case 'put':
                    getApi('employee').update(req, res);
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

module.exports = UserController;
