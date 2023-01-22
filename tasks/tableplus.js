"use strict";

const _ = require("lodash");
const clipboardy = require("clipboardy");
const filterServices = require("../src/filter-services").filterServices;
const dbServiceGet = require("../src/db-services").get;
const fs = require("fs");

module.exports = (lando) => ({
  command: "tableplus",
  describe: "Opens the database in the Sequelpro GUI",
  level: "app",
  options: _.merge({}, lando.cli.formatOptions(), {
    service: {
      describe: "Specify the database service",
      alias: ["s"],
      default: "database",
    },
  }),
  run: (options) => {
    const app = lando.getApp(options._app.root);
    // Get services
    app.opts = !_.isEmpty(options.service) ? { services: options.service } : {};
    return app.init().then(() => {
      const info = _.filter(app.info, (service) =>
        filterServices(service.service, options.service)
      );
      const dbservice = dbServiceGet(app, info);
      const random = Math.floor(Math.random() * 1000000);
      const filename = `/tmp/docksal-sequelpro-${random}.spf`;

      const external = dbservice.external_connection.port;
      const creds = dbservice.creds;
      const mysqlTypes = ["mariadb", "mysql", "postgre"];

      if (mysqlTypes.some((v) => dbservice.type.includes(v))) {
        let $com = "";
        switch (dbservice.type) {
          default:
            $com = `${dbservice.type}://`;
        }

        lando.shell.sh(
          [
            "open",
            `${$com}${creds.user}:${creds.password}@127.0.0.1:${external}?statusColor=007F3D&enviroment=local&name=${app._name}`,
          ],
          {
            mode: "exec",
            detached: true,
          }
        );

        return;
      } else {
        console.log(
          "Currently only MySQL, Postgre and MariaDB connections are supported"
        );
      }
    });
  },
});
