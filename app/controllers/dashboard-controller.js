function DashboardController() {
    this.tag = 'dashboardController';

    this.ApiRouter = {
        patron: function(verb, req, res, self) {
            switch (verb) {
                case 'post':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'get':
                    getApi('dashboard').getPatronChartData(req, res);
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

        game: function(verb, req, res, self) {
            switch (verb) {
                case 'post':
                    self.getErrorApi().sendError(1011, 403, res);
                    break;
                case 'get':
                    getApi('dashboard').getGameChartDate(req, res);
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

module.exports = DashboardController;
