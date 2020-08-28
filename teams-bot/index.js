/* jshint esversion: 8 */

const path = require('path');

const express = require('express');
const app = express();
app.use(express.json());

const PORT = 3000;

const db = require('./app/db');
const webserver = require('./app/webserver');

// Import required bot configuration.
const ENV_FILE = path.join(__dirname, '.env');
console.log("ENV_FILE:", ENV_FILE);
require('dotenv').config({ path: ENV_FILE });

const { BotFrameworkAdapter } = require('botbuilder');

const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    channelService: process.env.ChannelService,
    openIdMetadata: process.env.BotOpenIdMetadata
});

const onTurnErrorHandler = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    console.error(`\n [onTurnError] unhandled error: ${ error }`);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${ error }`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Send a message to the user
    await context.sendActivity('The bot encountered an error or bug.');
    await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

// Set the onTurnError for the singleton BotFrameworkAdapter.
adapter.onTurnError = onTurnErrorHandler;

db.start((errConnect, dbo) => {
    if (errConnect) {
        console.error("errConnect =", errConnect);
        return;
    }
    console.log("Starting webserver connection");
    webserver.start(dbo, adapter, () => {

    });
});

