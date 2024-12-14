'use strict';

const _ = require('lodash');
const filterServices = require('../src/filter-services').filterServices;
const dbServiceGet = require('../src/db-services').get;

module.exports = lando => ({
  command: 'dbeaver',
  describe: 'Opens the database in the dBeaver GUI',
  level: 'app',
  options: _.merge({}, lando.cli.formatOptions(), {
    service: {
      describe: 'Specify the database service',
      alias: ['s'],
      array: false,
    },
  }),
  run: options => {
    const app = lando.getApp(options._app.root);
    // Get services
    app.opts = (!_.isEmpty(options.service)) ? { services: options.service } : {};
    return app.init().then(() => {
      const info = _.filter(app.info, service => filterServices(service.service, options.service))
      const dbservice = dbServiceGet(app, info)

      const binary = 'dbeaver'
      const wbPath = lando.shell.which(binary)
      if (!wbPath) {
        console.log(`${binary} was not found in your $PATH`)
        return
      }

      const external = dbservice.external_connection.port
      const creds = dbservice.creds
      const mysqlTypes = ['mariadb', 'mysql']
      if (mysqlTypes.some(v => dbservice.type.includes(v))) {
        lando.shell.sh([`${binary}`, '-nosplash', '-con', `"name=${creds.database}|driver=mysql|port=${external}|host=localhost|user=${creds.user}|password=${creds.password}|database=${creds.database}|connect=true"`], '&', { mode: 'exec', detached: true })
          .catch(err => {
            lando.log.error(err)
          })
          .then(results => {
            console.log(results)
          })

        return

      }
      else {
        console.log('Currently only MySQL and MariaDB connections are supported')
      }

    });
  },
});