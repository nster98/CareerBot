// Slack Bot
const express = require('express');
const request = require('request');
const path = require('path');
const { create } = require('domain');
const MongoClient = require('mongodb').MongoClient;

const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

const app = express();
app.use(express.json());
const PORT = 3000;

const databaseName = "testDB";
const mongo_url = `mongodb+srv://main_user:${ process.env.MONGO_PASSWORD }@career-place-test-clust.u796u.mongodb.net/${ databaseName }?retryWrites=true&w=majority`;

const mongo_client = new MongoClient(mongo_url, { useUnifiedTopology: true });
var mongoConnect = mongo_client.connect();

const database = {};
database["botInfo"] = { channel: process.env.CHANNEL};

mongoConnect.then(function(db) {
    var collection = mongo_client.db(databaseName).collection('botInfo');
    //collection.insertOne({ channel: process.env.CHANNEL });
    collection.updateOne({ channel: /[\s\S]*/ }, { $set: {channel: process.env.CHANNEL} });
    return db;
});

const Steps = {
    INIT_STEP: 'initStep',
    TYPE_STEP: 'typeStep',
    TOPPINGS_STEP: 'toppingsStep',
    ADDRESS_STEP: 'addressStep',
    SUMMARY_STEP: 'summaryStep'
};

// Send beginning message
sendMessage(createMessage(database["botInfo"], "Hi, my name is PizzaBot, what can I get you?"));

app.post('/slack/events', async function(req, res){

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

    //console.log("Payload: ", payload.event);

    /*
        Algorithm for sending sequential messages

        Check if this is a user sending a message
            Make sure that the user exists
                If not, make a new user
            Check for a step that requires information from the user and update database with text
            Go through steps
                If a field doesn't exist, send a message letting the user know
                If a field does exist, go to the next step
            Send the message
            Send a 200 response to server
    */

    // Check if this is a message from a user and not from a bot
    if (!payload.event.bot_profile) {
        
        // Check if this message was sent in an IM only
        if (payload.event.channel_type == 'im' && payload.event.type == 'message') {

            let msg;

            if (!database[payload.event.user]) {
                database[payload.event.user] = {};
                database[payload.event.user].currStep = Steps.INIT_STEP;   
            }

            let user = database[payload.event.user];


            var collection = mongo_client.db(databaseName).collection('customers');
            //collection.insertOne({ userId: payload.event.user, currStep: Steps.INIT_STEP });
            let customer = await collection.find({userId: payload.event.user}).toArray();
            if (!customer[0]) {
                collection.insertOne({ userId: payload.event.user, currStep: Steps.INIT_STEP });
                console.log("Inserting user ", payload.event.user);

                customer = await collection.find({userId: payload.event.user}).toArray();
            }
            //collection.updateOne({ userId: payload.event.user }, { $set: {currStep: Steps.INIT_STEP} });

            console.log("currStep before anything else: ", customer[0].currStep);

            if (customer[0].currStep == Steps.TYPE_STEP) {
                if (!customer[0].typePizza){
                    //customer.typePizza = payload.event.text;
                    collection.updateOne({userId: payload.event.user}, {$set: {typePizza: payload.event.text}});
                }
            }
            if (customer[0].currStep == Steps.TOPPINGS_STEP) {
                if (!customer[0].toppings){
                    //user.toppings = payload.event.text;
                    collection.updateOne({userId: payload.event.user}, {$set: {toppings: payload.event.text}});
                }
            }
            if (customer[0].currStep == Steps.ADDRESS_STEP) {
                if (!customer[0].address){
                    //user.address = payload.event.text;
                    collection.updateOne({userId: payload.event.user}, {$set: {address: payload.event.text}});
                }
            }
    
            // STEP CODE
            if (customer[0].currStep == Steps.INIT_STEP)
            {
                var args = payload.event.text.split(" ");

                args.forEach(function(arg) {
                    if (arg.includes("type:")) {
                        var tempType = arg.replace('type:', '');
                        collection.updateOne({userId: payload.event.user}, {$set: {typePizza: tempType}});
                    }
                    else if (arg.includes("topping:")) {
                        var tempTopping = arg.replace('topping:', '');
                        collection.updateOne({userId: payload.event.user}, {$set: {toppings: tempTopping}});
                    }
                    else if (arg.includes("address:")) {
                        var tempAddress = arg.replace('address:', '');
                        collection.updateOne({userId: payload.event.user}, {$set: {address: tempAddress}});
                    }
                });
                collection.updateOne({userId: payload.event.user}, {$set: {currStep: Steps.TYPE_STEP}});
            }

            customer = await collection.find({userId: payload.event.user}).toArray();

            if (customer[0].currStep == Steps.TYPE_STEP) 
            {
                if (!customer[0].typePizza) {
                    msg = createMessage(payload.event, 
                        "You didn't tell me what type of pizza you would like. What type of pizza would you like?");
                    console.log("message: ", msg);
                } else {
                    collection.updateOne({userId: payload.event.user}, {$set: {currStep: Steps.TOPPINGS_STEP}});
                }
            }

            customer = await collection.find({userId: payload.event.user}).toArray();

            if (customer[0].currStep == Steps.TOPPINGS_STEP) 
            {
                if (!customer[0].toppings) {
                    msg = createMessage(payload.event, 
                        "You didn't tell me what toppings you would like. What toppings would you like?");
                } else {
                    collection.updateOne({userId: payload.event.user}, {$set: {currStep: Steps.ADDRESS_STEP}});
                }
            }

            customer = await collection.find({userId: payload.event.user}).toArray();

            if (customer[0].currStep == Steps.ADDRESS_STEP) 
            {
                if (!customer[0].address) {
                    msg = createMessage(payload.event, 
                        "You didn't tell me your address. What is your address?");
                } else {
                    collection.updateOne({userId: payload.event.user}, {$set: {currStep: Steps.SUMMARY_STEP}});
                }
            }

            customer = await collection.find({userId: payload.event.user}).toArray();

            if (customer[0].currStep == Steps.SUMMARY_STEP) 
            {
                msg = createMessage(payload.event,
                    "Your order of a " + customer[0].typePizza + " pizza with " + customer[0].toppings + " will be delivered to " + customer[0].address);
                
                    collection.updateOne({userId: payload.event.user}, {$set: {currStep: Steps.INIT_STEP}});
            }
    
            sendMessage(msg);

            // // When coming back after sending a message, update the database with the user input
            // if (user.currStep == Steps.TYPE_STEP) {
            //     if (!user.typePizza){
            //         user.typePizza = payload.event.text;
            //     }
            // }
            // if (user.currStep == Steps.TOPPINGS_STEP) {
            //     if (!user.toppings){
            //         user.toppings = payload.event.text;
            //     }
            // }
            // if (user.currStep == Steps.ADDRESS_STEP) {
            //     if (!user.address){
            //         user.address = payload.event.text;
            //     }
            // }

            // // STEP CODE
            // if (user.currStep == Steps.INIT_STEP)
            // {
            //     var args = payload.event.text.split(" ");

            //     args.forEach(function(arg) {
            //         if (arg.includes("type:")) {
            //             user.typePizza = arg.replace('type:', '');
            //         }
            //         else if (arg.includes("topping:")) {
            //             user.toppings = arg.replace('topping:', '');
            //         }
            //         else if (arg.includes("address:")) {
            //             user.address = arg.replace('address:', '');
            //         }
            //     });
            //     user.currStep = Steps.TYPE_STEP;
            // }
            // if (user.currStep == Steps.TYPE_STEP) 
            // {
            //     if (!user.typePizza) {
            //         msg = createMessage(payload.event, 
            //             "You didn't tell me what type of pizza you would like. What type of pizza would you like?");
            //     } else {
            //         user.currStep = Steps.TOPPINGS_STEP;
            //     }
            // }
            // if (user.currStep == Steps.TOPPINGS_STEP) 
            // {
            //     if (!user.toppings) {
            //         msg = createMessage(payload.event, 
            //             "You didn't tell me what toppings you would like. What toppings would you like?");
            //     } else {
            //         user.currStep = Steps.ADDRESS_STEP;
            //     }
            // }
            // if (user.currStep == Steps.ADDRESS_STEP) 
            // {
            //     if (!user.address) {
            //         msg = createMessage(payload.event, 
            //             "You didn't tell me your address. What is your address?");
            //     } else {
            //         user.currStep = Steps.SUMMARY_STEP;
            //     }
            // }
            // if (user.currStep == Steps.SUMMARY_STEP) 
            // {
            //     msg = createMessage(payload.event,
            //         "Your order of a " + user.typePizza + " pizza with " + user.toppings + " will be delivered to " + user.address);
                
            //     user.currStep = Steps.INIT_STEP;
            // }
            // // Create the message you want the bot to say
            // //msg = createMessage(payload.event, `Echo: ${payload.event.text}`);
    
            // sendMessage(msg);
        }
    }

    res.sendStatus(200);
});


mongo_client.connect(function(err, client) {
    const collection = client.db("test").collection("devices");
    // perform actions

    console.log("Connected to mongodb good?????");

    app.listen(PORT, () => {
        console.log(`Listening on http://localhost:${PORT}`);
    });

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