function OrganizationController() {
    this.tag = 'organizationController';

    this.ApiRouter = {

        patron: function(verb, req, res, self) {
            switch (verb) {
                case 'post':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'get':
                    getApi('organization').retrieve_patrons(req, res);
                    break;
                case 'put':
                    self.getErrorApi().sendError(1011, 403, res);;
                    break;
                case 'delete':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                default:
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
            }
        },

        employee: function(verb, req, res, self) {
            switch (verb) {
                case 'post':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'get':
                    getApi('organization').retrieve_employees(req, res);
                    break;
                case 'put':
                    getApi('employee').update_admin(req, res);
                    break;
                case 'delete':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                default:
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
            }
        },

        invite: function(verb, req, res, self) {
            switch (verb) {
                case 'post':
                    getApi('organization').invitation(req, res);
                    break;
                case 'get':
                    getApi('organization').getAllInvitation(req, res);
                    break;
                case 'put':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'delete':
                    getApi('organization').cancelInvitation(req, res);
                    break;
                default:
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
            }
        },

        address: function(verb, req, res, self) {
            switch (verb) {
                case 'post':
                    getApi('organization').add_address(req, res);
                    break;
                case 'get':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'put':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'delete':
                    getApi('organization').remove_address(req, res);
                    break;
                default:
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
            }
        },

        default: function(verb, req, res, self) {
            switch (verb) {
                case 'post':
                    getApi('organization').post_create(req, res);
                    break;
                case 'get':
                    getApi('organization').get_organization(req, res);
                    break;
                case 'put':
                    getApi('organization').put_update(req, res);
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

module.exports = OrganizationController;
