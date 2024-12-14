"use strict";

const _ = require("lodash");
const filterServices = require("../src/filter-services").filterServices;
const dbServiceGet = require("../src/db-services").get;
const fs = require("fs");

module.exports = (lando) => ({
  command: "sequelpro",
  describe: "Opens the database in the Sequelpro GUI",
  level: "app",
  options: _.merge({}, lando.cli.formatOptions(), {
    service: {
      describe: "Specify the database service",
      alias: ["s"],
      default: "database",
    },
  }),
  run: async (options) => {
    const app = lando.getApp(options._app.root);
    // Get services
    app.opts = !_.isEmpty(options.service) ? options.service : services;

    // Initialize the app
    await app.init();

    const info = _.filter(app.info, (service) => filterServices(service.service, options.service));

    const dbservice = dbServiceGet(app, info);
    const random = Math.floor(Math.random() * 1000000);
    const filename = `/tmp/docksal-sequelpro-${random}.spf`;

    const external = dbservice.external_connection.port;
    const creds = dbservice.creds;
    const mysqlTypes = ["mariadb", "mysql"];

    const xml = `<?xml version="1.0" encoding="UTF-8"?><?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>ContentFilters</key>
  <dict/>
  <key>auto_connect</key>
  <true/>
  <key>data</key>
  <dict>
    <key>connection</key>
    <dict>

      <key>database</key>
      <string>${creds.database}</string>
      <key>host</key>
      <string>127.0.0.1</string>
      <key>name</key>
      <string>${app._name}</string>
      <key>user</key>
      <string>${creds.user}</string>
      <key>password</key>
      <string>${creds.password}</string>
      <key>port</key>
      <integer>${external}</integer>
      <key>rdbms_type</key>
      <string>mysql</string>
    </dict>
    <key>session</key>
    <dict/>
  </dict>
  <key>encrypted</key>
  <false/>
  <key>format</key>
  <string>connection</string>
  <key>queryFavorites</key>
  <array/>
  <key>queryHistory</key>
  <array/>
  <key>rdbms_type</key>
  <string>mysql</string>
  <key>version</key>
  <integer>1</integer>
</dict>
</plist>`;

    if (mysqlTypes.some((v) => dbservice.type.includes(v))) {
      try {
        fs.writeFileSync(filename, xml);
        // file written successfully
      } catch (err) {
        console.error(err);
      }

      lando.shell.sh(["open", `${filename}`], {
        mode: "exec",
        detached: true,
      });

      return;
    } else {
      console.log(
        "Currently only MySQL and MariaDB connections are supported"
      );
    }
  }
});