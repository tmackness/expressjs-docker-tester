/**
 * Packages
 */
// Add this to the VERY top of the first file loaded in your app
// https://www.elastic.co/guide/en/apm/agent/nodejs/current/express.html
const apm = require("elastic-apm-node").start({
  // Override service name from package.json
  // Allowed characters: a-z, A-Z, 0-9, -, _, and space
  serviceName: process.env.ELASTIC_APM_SERVICE_NAME || "ExpressJS-API",

  // Use if APM Server requires a token
  // secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,

  // Set custom APM Server URL (default: http://localhost:8200)
  serverUrl: process.env.ELASTIC_APM_SERVER_URL || "http://apm-server:8200"
});

const express = require("express");
const bodyParser = require("body-parser");
const os = require("os");
const cors = require("cors");

if (process.env.NODE_ENV === "development") {
  const dotenv = require("dotenv");
  dotenv.config();
}
const chalk = require("chalk");
const morgan = require("morgan");
const Redis = require("ioredis");
const consul = require("consul")({
  host: process.env.DOCKER_HOST || "172.17.0.1",
  promisify: true
});
const config = require("./config");

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT || 6379,
  // db: 0
  password: process.env.REDIS_PASS
  // tls: { // in docker i think it is automatically connected through tls??? or at least consul connect?
  //   key: stringValueOfKeyFile,
  //   cert: stringValueOfCertFile,
  //   ca: [ stringValueOfCaCertFile ]
  // }
});

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
// mongoose.set('useFindAndModify', false);
// mongoose.set('useCreateIndex', true);
// mongoose.set('useNewUrlParser', true);
// mongoose.connect(process.env.MONGO_URI);
// mongoose.connection.on('connected', () => {
//   console.log(chalk.green(`✓ MongoDB default connection is connected to ${process.env.MONGO_URI}`));
// });
// mongoose.connection.on('error', (err) => {
//   console.error(err);
//   console.log(chalk.red('✗ MongoDB connection error. Please make sure MongoDB is running.'));
//   process.exit();
// });

/**
 * Express configuration.
 */
app.set("host", process.env.NODE_IP || "0.0.0.0");
app.set("port", process.env.PORT || 1000);
app.use(
  bodyParser.json({
    // Stops someone from send large amount of data
    limit: config.bodyLimit
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.disable("x-powered-by");
app.use(morgan("dev"));

/**
 * API routes.
 */
app.get("/", (req, res) => {
  const hostname = os.hostname();
  const interfaces = os.networkInterfaces();
  console.log(interfaces);

  consul.kv.get("test", (err, result) => {
    if (err) throw err;
    res.json({
      consul: result,
      hostname,
      dockerHost: process.env.DOCKER_HOST,
      interfaces,
      containerIP: interfaces.eth1[0].address
    });
  });

  // res.send('hello from container IP: ' + ip + ' Network Interfaces: ' + interfaces)
});

app.get("/redis", async (req, res) => {
  // console.log(req.query.key);

  // consul set/get
  const consulSet = await consul.kv.set("testKey", req.query.key);
  console.log(consulSet);
  const consulGet = await consul.kv.get("testKey");
  console.log(consulGet);

  // redis set/get
  redis.set("key", req.query.key);
  const get = await redis.get("key");
  if (get) {
    return res.send({
      Redis: get,
      Consul: consulGet
    });
  }

  res.send("Use a query string e.g. /redis?key=something");
});

// Elastic APM Error Test
app.get("/error", async (req, res) => {
  throw new Error("Ahh error");
  console.log(`i'm a log...`);
});

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === "development") {
  // only use in development
  const errorHandler = require("errorhandler");
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send("Server Error");
  });
}

/**
 * Start Express server.
 */
app.listen(app.get("port"), () => {
  if (app.get("env") === "development") {
    console.log(
      `${chalk.green("✓")} App is running at http://localhost:${chalk.cyan(
        app.get("port")
      )} in ${chalk.yellow(app.get("env"))} mode`
    );
    console.log(chalk.yellow("  Press CTRL-C to stop\n"));
  } else {
    console.log(
      `App is running at ${app.get("host")}:${app.get("port")} in ${app.get(
        "env"
      )} mode`
    );
  }
});

// export default app;
module.exports = app;
