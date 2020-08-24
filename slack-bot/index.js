/* jshint esversion: 8 */

// Slack Bot
const express = require('express');
const path = require('path');

const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

const app = express();
app.use(express.json());

const db = require('./app/db');
const webserver = require('./app/webserver');

const FILE_NAME = __filename + ': ';

console.log(FILE_NAME + 'starting DB');

db.start((errConnect, dbo) => {
  if (errConnect) {
    log.error(FILE_NAME + 'errConnect = ', errConnect);
    return;
  }
  console.log(FILE_NAME + 'starting webserver');
  webserver.start(dbo, () => {
  });
});