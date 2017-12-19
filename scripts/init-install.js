/*  Title: init install
    Author:  Hubbert
    Date: Jan 21 2017
    Comment: 
        This should do everything we need to the datebase to get your project started.
*/

require(process.env.PWD + '/bootstrap.js').init();
var Umzug = require('umzug');
var Promise = getPromise();


return global.models.sequelize.sync()
    .then(function() {
        logger.info('Adding old migrations to the database...');
        umzug = new Umzug({
            storage: 'sequelize',
            storageOptions: {
                sequelize: models.sequelize,
                model: models.sequelize_meta,
                modelName: 'sequelize_meta',
                columnType: new models.Sequelize.STRING(100)
            },
            migrations: {
                params: [models.sequelize.getQueryInterface(), models.Sequelize],
                path: 'seeders/init'
            }
        });
        return umzug.up();
    }).then(function(arr) {
        if(arr && arr[0]){
            logger.info('Seed file has been run ' + arr[0].file);
            process.exit(0);
        }else{
            logger.error('No seed file has been run!, is it already loaded?');
            process.exit(1);
        }
    });
