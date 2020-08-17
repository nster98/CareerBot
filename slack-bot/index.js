// Slack Bot
const express = require('express');
const request = require('request');
const path = require('path');
const { create } = require('domain');

const app = express();
app.use(express.json());
const PORT = 3000;

const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

const database = {};
database["botInfo"] = { channel: process.env.CHANNEL};

const Steps = {
    INIT_STEP: 'initStep',
    TYPE_STEP: 'typeStep',
    TOPPINGS_STEP: 'toppingsStep',
    ADDRESS_STEP: 'addressStep',
    SUMMARY_STEP: 'summaryStep'
};

let currStep = Steps.INIT_STEP;

// Send beginning message
sendMessage(createMessage(database["botInfo"], "Hi, my name is PizzaBot, what can I get you?"));

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

            let msg;

            if (currStep == Steps.INIT_STEP)
            {
                if (!database[payload.event.user])
                    database[payload.event.user] = {};

                // Do the CLI thing here
            }
            else if (currStep == Steps.TYPE_STEP) 
            {

            }
            else if (currStep == Steps.TOPPINGS_STEP) 
            {
                
            }
            else if (currStep == Steps.ADDRESS_STEP) 
            {
                
            }
            else if (currStep == Steps.SUMMARY_STEP) 
            {
                
            }
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