'use strict';

const _ = require('lodash');
const clipboardy = require('clipboardy');
const filterServices = require('../src/filter-services').filterServices;
const dbServiceGet = require('../src/db-services').get;

module.exports = lando => ({
  command: 'dbport',
  describe: 'Displays the current external database port',
  level: 'app',
  options: _.merge({}, lando.cli.formatOptions(), {
    service: {
      describe: 'Get port info for only the specified service',
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

      const external = dbservice.external_connection.port
      const service = dbservice.service
      clipboardy.writeSync(external)
      console.log(external)
      console.log(`Port number ${external} for service '${service}' copied to clipboard!`)
    });
  },
});
