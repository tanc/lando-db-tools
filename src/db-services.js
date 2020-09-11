// Helper to fetch a database service
function get(app, info) {
  let dbservice = {}
  if (!info[0]) {
    if (app.opts.services) {
      const service = app.opts.services
      console.log(`Service '${service}' was not found`)
    }
    return
  }
  if (info.length > 1) {
    // Filter the services down.
    Object.entries(info).forEach(([key, service]) => {
      if ('external_connection' in service) {
        dbservice = service
      }
    })
  }
  else {
    dbservice = info[0]
  }

  if (!('external_connection' in dbservice)) {
    if (app.opts.services) {
      console.log(`The requested service '${app.opts.services}' does not have an external connection configured`)
    }
    else {
      console.log('No service with an external connection was found')
    }
    return
  }

  return dbservice
};

exports.get = get