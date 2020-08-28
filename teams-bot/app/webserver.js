// webserver.js
// Code to start and communicate with the web server

/* jshint esversion: 8 */

const FILE_NAME = __filename + ': ';
const PORT = 3000;

const express = require('express');
const app = express();
app.use(express.json());

const request = require('request');

class WebServer {
    start(dbo, adapter, cbStart) {
        console.log(FILE_NAME + 'I\'m starting Webserver');
        this.dbo = dbo;

        this.initRoute(adapter);

        app.listen(PORT, () => {
            console.log(`${FILE_NAME} Listening on http://localhost:${PORT}`);
            return cbStart();
        });
    }

    initRoute(adapter) {
        console.log("Adapter: ", adapter);
        app.post('/api/messages', (req, res) => {
            console.log(FILE_NAME + " Getting /api/messages");
            res.status(200).send("Hello world");

            adapter.processActivity(req, res, async (context) => {
                console.log("Processing activity........");
                console.log("Context:", context._activity);

                await context.sendActivity("Hello world");
            });
        });
    }
}

module.exports = new WebServer();