const _ = require('lodash');

// Helper to filter services
function filterServices(service, services = []) {
  return !_.isEmpty(services) ? _.includes(services, service) : true;
};

exports.filterServices = filterServices