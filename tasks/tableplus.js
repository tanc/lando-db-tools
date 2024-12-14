"use strict";

const _ = require("lodash");
const filterServices = require("../src/filter-services").filterServices;
const dbServiceGet = require("../src/db-services").get;

module.exports = (lando) => ({
  command: "tableplus",
  describe: "Opens the database in the TablePlus GUI",
  level: "app",
  options: _.merge({}, lando.cli.formatOptions(), {
    service: {
      describe: "Specify the database service",
      alias: ["s"],
      default: "database",
    },
  }),
  run: async (options) => {
    try {
      const app = await lando.getApp(options._app.root);
      // Set service filter options
      const serviceFilter = !_.isEmpty(options.service) ? options.service : "database";
      // Initialize app
      await app.init();
      // Get filtered services
      const services = _.filter(app.info, (service) =>
        filterServices(service.service, serviceFilter)
      );

      if (_.isEmpty(services)) {
        console.error("No matching database services found.");
        return;
      }

      // Get database service information
      const dbService = dbServiceGet(app, services);
      if (!dbService || !dbService.external_connection || !dbService.creds) {
        console.error("Could not retrieve database connection details.");
        return;
      }

      const { port: externalPort } = dbService.external_connection;
      const { user, password, database } = dbService.creds;
      const supportedDbTypes = ["mariadb", "mysql", "postgresql", "postgres"];

      // Replace dbService.type with a valid database type
      const validDbType = supportedDbTypes.find((type) => dbService.type.includes(type));

      if (validDbType) {
        const connectionUrl = `${validDbType}://${user}:${password}@127.0.0.1:${externalPort}/${database}?statusColor=007F3D&environment=local&name=${app.name}`;

        const osType = process.platform;
        if (osType === "darwin") {
          const tablePlusAppPath = "/Applications/TablePlus.app/Contents/MacOS/TablePlus";
          const setappPath = "/Applications/Setapp/TablePlus.app/Contents/MacOS/TablePlus";

          const appPath = require("fs").existsSync(setappPath) ? setappPath : tablePlusAppPath;
          lando.shell.sh(["open", connectionUrl, "-a", appPath], { mode: "exec", detached: true });
        } else {
          console.error("Unsupported operating system for TablePlus integration.");
        }
      } else {
        console.error(
          "Currently only MySQL, Postgre and MariaDB connections are supported"
        );
      }
    } catch (err) {
      console.error("An error occurred while running the tableplus command:", err);
    }
  },
});