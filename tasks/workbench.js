'use strict';

const _ = require('lodash');
const clipboardy = require('clipboardy');
const filterServices = require('../src/filter-services').filterServices;
const dbServiceGet = require('../src/db-services').get;

module.exports = lando => ({
  command: 'workbench',
  describe: 'Opens the database in MySQL Workbench GUI',
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

      const binary = 'mysql-workbench'
      const wbPath = lando.shell.which(binary)
      if (!wbPath) {
        console.log(`${binary} was not found in your $PATH`)
        return
      }

      const external = dbservice.external_connection.port
      const service = dbservice.service
      const creds = dbservice.creds

      clipboardy.writeSync(creds.password)
      console.log(`Password for service '${service}' copied to clipboard!`)

      lando.shell.sh([`${binary}`, '--query', `${creds.user}@localhost:${external}`], { mode: 'exec', detached: true })
        .catch(err => {
          lando.log.error(err)
        })
        .then(results => {
          console.log(results)
        })

      return
    });
  },
});
