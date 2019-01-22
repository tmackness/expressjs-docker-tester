'use strict';
/**
 * Packages
 */
const express = require('express');
const bodyParser = require('body-parser');
const os = require('os');
const cors = require('cors');
if (process.env.NODE_ENV === 'development') {
  const dotenv = require('dotenv');
  dotenv.config();
}
const chalk = require('chalk');
const morgan = require('morgan');
const config = require('./config');
const Redis = require('ioredis');
const redis  = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
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
// mongoose.connect(process.env.MONOGO_URI);
// mongoose.connection.on('connected', () => {
//   console.log(chalk.green(`✓ MongoDB default connection is connected to ${process.env.MONOGO_URI}`));
// });
// mongoose.connection.on('error', (err) => {
//   console.error(err);
//   console.log(chalk.red('✗ MongoDB connection error. Please make sure MongoDB is running.'));
//   process.exit();
// });

/**
 * Express configuration.
 */
app.set('host', process.env.NODE_IP || '0.0.0.0');
app.set('port', process.env.PORT || 1000);
app.use(bodyParser.json({
  // Stops someone from send large amount of data
  limit: config.bodyLimit
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.disable('x-powered-by');
app.use(morgan('dev'));

/**
 * API routes.
 */
app.get('/', (req, res) => {
  const hostname = os.hostname();
  const interfaces = os.networkInterfaces();
  console.log(interfaces);
  res.json({
    hostname,
    interfaces: interfaces.eth1[0].address
  })
  // res.send('hello from conatiner IP: ' + ip + ' Network Interfaces: ' + interfaces)
})

app.get('/redis', async (req, res) => {
  // console.log(req.query.key);
  redis.set('key', req.query.key);
  const get = await redis.get('key');
  if (get) {
    return res.send(`REDIS: ${get}`)
  }

  res.send('Use a query string e.g. /redis?key=something')
})

 /**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
  // only use in development
  const errorHandler = require('errorhandler');
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server Error');
  });
}

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  if (app.get('env') === 'development') {
    console.log(`${chalk.green('✓')} App is running at http://localhost:${chalk.cyan(app.get('port'))} in ${chalk.yellow(app.get('env'))} mode`);
    console.log(chalk.yellow('  Press CTRL-C to stop\n'));
  } else {
    console.log(`App is running at ${app.get('host')}:${app.get('port')} in ${app.get('env')} mode`);
  }
});

// export default app;
module.exports = app;
