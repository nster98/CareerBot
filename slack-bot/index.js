// Slack Bot
const express = require('express');
const request = require('request');
const path = require('path');

const app = express();
app.use(express.json());
const PORT = 3000;

const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

app.post('/slack/events', (req, res) => {

    // Take care of Events API verification only when trying to verify
    if (req.body.type == 'url_verification') {
        res.status(200).json(
            {
                challenge: req.body.challenge
            });
        console.log(req.body);
    }
    
    // Get the request which contains the message
    let payload = req.body;

    console.log("Payload: ", payload.event);

    // Check if this is a message from a user and not from a bot
    if (!payload.event.bot_profile) {
        
        // Check if this message was sent in an IM only
        if (payload.event.channel_type == 'im' && payload.event.type == 'message') {

            // Create the message you want the bot to say
            msg = createMessage(payload.event, `Echo: ${payload.event.text}`);
    
            sendMessage(msg);
        }
    }

    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});

function createMessage(payload, msg)
{
    return response = {
        token: process.env.BOT_TOKEN,
        text: msg,
        channel: payload.channel
    };
}

function sendMessage(msg) 
{
    let options = {
        'method': 'POST',
        'url': 'https://slack.com/api/chat.postMessage?token='+msg.token+'&channel='+msg.channel+'&text='+msg.text,
        'headers': {
            'Content-Type': 'application/json'
        },
        body: msg
    };

    request.post(options.url, function(err, res, body) {
        console.log("\nPosted message\n");
    });
}