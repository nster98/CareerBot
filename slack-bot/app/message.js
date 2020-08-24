// Message.js
// Helper functions for sending messages to Slack

/* jshint esversion: 8*/

const path = require('path');
const request = require('request');
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

function createAndSend(payload, msg) {
    sendMessage(createMessage(payload, msg));
}

function createMessage(payload, msg) {
  return {
    token: process.env.BOT_TOKEN,
    text: msg,
    channel: payload.channel
  };
}

function sendMessage(msg) {
  let options = {
    'method': 'POST',
    'url': 'https://slack.com/api/chat.postMessage?token=' + msg.token + '&channel=' + msg.channel + '&text=' + msg.text,
    'headers': {
      'Content-Type': 'application/json'
    },
    body: msg
  };

  request.post(options.url, () => {
    console.log("Message posted:", options.body.text);
  });
}

module.exports = {
    createAndSend
};