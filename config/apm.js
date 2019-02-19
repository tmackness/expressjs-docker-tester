// Add this to the VERY top of the first file loaded in your app
// https://www.elastic.co/guide/en/apm/agent/nodejs/current/express.html
// See config options - https://www.elastic.co/guide/en/apm/agent/nodejs/1.x/agent-api.html#service-version

const frameworkVersion = require("express").version;
const pjson = require("../package.json").version;

const apmOptions = {
  // send package version number - might be better to use git tags?
  serviceVersion: pjson,

  // Override service name from package.json
  // Allowed characters: a-z, A-Z, 0-9, -, _, and space
  serviceName: process.env.ELASTIC_APM_SERVICE_NAME || "ExpressJS-API",

  // Use if APM Server requires a token
  // secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,

  // Only activate the agent if it's running in production
  active:
    process.env.NODE_ENV === "production" ||
    process.env.ELASTIC_APM_ENABLE === true,

  // send through request body with (off | errors | transactions | all)
  // NOTE: be careful with this as sensitive data may be in the body.
  captureBody: "errors",

  // Use a custom logger
  // logger: require('bunyan')({ level: 'info' }),

  frameworkName: process.env.ELASTIC_APM_FRAMEWORK_NAME || "express-js",
  frameworkVersion
};

module.exports = apmOptions;
