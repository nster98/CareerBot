// webserver.js
// Code to start and communicate with the web server

/* jshint esversion: 8 */

const FILE_NAME = __filename + ': ';
const PORT = 3000;

const express = require('express');
const app = express();
app.use(express.json());

const message = require('./message');

const Steps = {
  INIT_STEP: 'initStep',
  TYPE_STEP: 'typeStep',
  TOPPINGS_STEP: 'toppingsStep',
  ADDRESS_STEP: 'addressStep',
  SUMMARY_STEP: 'summaryStep'
};

class WebServer {
  start(dbo, cbStart) {
    console.log(FILE_NAME + 'I\'m starting Webserver');
    this.dbo = dbo;

    //this.initRoutes();

    dbo.collection("botInfo").find({ channel: /[\s\S]*/ }).toArray(function (err, arr) {
      console.log("Channel from dbo: ", arr[0].channel);
      message.createAndSend(arr[0], "Hi, my name is PizzaBot, what can I get you?");
    });

    this.botRun();

    app.listen(PORT, () => {
      console.log(`${FILE_NAME} Listening on http://localhost:${PORT}`);
      return cbStart();
    });
  }

  botRun() {
    const $this = this;

    app.post('/slack/events', async function (req, res) {

      // Take care of Events API verification only when trying to verify
      if (req.body.type == 'url_verification') {
      res.status(200).json(
        {
          challenge: req.body.challenge
        });
      console.log(req.body);
      }

      let payload = req.body;

      if (!payload.event.bot_profile) {

        if (payload.event.channel_type == 'im' && payload.event.type == 'message') {

          let msg, customer;

          const customerCollection = $this.dbo.collection('customers');

          customer = await customerCollection.find({ userId: payload.event.user }).toArray();

          if (!customer[0]) {
            customerCollection.insertOne({ userId: payload.event.user, currStep: Steps.INIT_STEP });
            console.log("Inserting user ", payload.event.user);

            customer = await customerCollection.find({ userId: payload.event.user }).toArray();
          }
          //collection.updateOne({ userId: payload.event.user }, { $set: {currStep: Steps.INIT_STEP} });

          //console.log("currStep before anything else: ", customer[0].currStep);

          if (customer[0].currStep == Steps.TYPE_STEP) {
            if (!customer[0].typePizza) {
              await customerCollection.updateOne({ userId: payload.event.user }, { $set: { typePizza: payload.event.text } }); // NJC - use either await or callback to wait until complete
            }
          }
          if (customer[0].currStep == Steps.TOPPINGS_STEP) {
            if (!customer[0].toppings) {
              await customerCollection.updateOne({ userId: payload.event.user }, { $set: { toppings: payload.event.text } }); // NJC - use either await or callback to wait until complete
            }
          }
          if (customer[0].currStep == Steps.ADDRESS_STEP) {
            if (!customer[0].address) {
              await customerCollection.updateOne({ userId: payload.event.user }, { $set: { address: payload.event.text } }); // NJC - use either await or callback to wait until complete
            }
          }

          customer = await customerCollection.find({ userId: payload.event.user }).toArray();

          // STEP CODE
          if (customer[0].currStep == Steps.INIT_STEP) {
            var args = payload.event.text.split(" ");

            args.forEach(async function (arg) {
              if (arg.includes("type:")) {
                var tempType = arg.replace('type:', '');
                await customerCollection.updateOne({ userId: payload.event.user }, { $set: { typePizza: tempType } }); // NJC - use either await or callback to wait until complete
              }
              else if (arg.includes("topping:")) {
                var tempTopping = arg.replace('topping:', '');
                await customerCollection.updateOne({ userId: payload.event.user }, { $set: { toppings: tempTopping } }); // NJC - use either await or callback to wait until complete
              }
              else if (arg.includes("address:")) {
                var tempAddress = arg.replace('address:', '');
                await customerCollection.updateOne({ userId: payload.event.user }, { $set: { address: tempAddress } }); // NJC - use either await or callback to wait until complete
              }
            });
            await customerCollection.updateOne({ userId: payload.event.user }, { $set: { currStep: Steps.TYPE_STEP } }); // NJC - use either await or callback to wait until complete
          }

          customer = await customerCollection.find({ userId: payload.event.user }).toArray(); // NJC - use either await or callback to wait until complete

          if (customer[0].currStep == Steps.TYPE_STEP) {
            if (!customer[0].typePizza) {
              msg = message.createAndSend(payload.event,
                "You didn't tell me what type of pizza you would like. What type of pizza would you like?");
              res.sendStatus(200);
            } else {
              await customerCollection.updateOne({ userId: payload.event.user }, { $set: { currStep: Steps.TOPPINGS_STEP } });
            }
          }

          customer = await customerCollection.find({ userId: payload.event.user }).toArray();

          if (customer[0].currStep == Steps.TOPPINGS_STEP) {
            if (!customer[0].toppings) {
              msg = message.createAndSend(payload.event,
                "You didn't tell me what toppings you would like. What toppings would you like?");
              res.sendStatus(200);
            } else {
              await customerCollection.updateOne({ userId: payload.event.user }, { $set: { currStep: Steps.ADDRESS_STEP } });
            }
          }

          customer = await customerCollection.find({ userId: payload.event.user }).toArray();

          if (customer[0].currStep == Steps.ADDRESS_STEP) {
            if (!customer[0].address) {
              msg = message.createAndSend(payload.event,
                "You didn't tell me your address. What is your address?");
              res.sendStatus(200);
            } else {
              await customerCollection.updateOne({ userId: payload.event.user }, { $set: { currStep: Steps.SUMMARY_STEP } });
            }
          }

          customer = await customerCollection.find({ userId: payload.event.user }).toArray();

          if (customer[0].currStep == Steps.SUMMARY_STEP) {
            msg = message.createAndSend(payload.event,
              "Your order of a " + customer[0].typePizza + " pizza with " + customer[0].toppings + " will be delivered to " + customer[0].address);
            res.sendStatus(200);

            await customerCollection.updateMany({ userId: payload.event.user }, { $unset: { typePizza: "", toppings: "", address: "" } });
            await customerCollection.updateOne({ userId: payload.event.user }, { $set: { currStep: Steps.INIT_STEP } });
          }
        }
      }
      //res.sendStatus(200);
    });

  }

  initRoutes() {
    const $this = this;
    app.get('/api/v1/customers', async function (req, res) {
      console.log(FILE_NAME + '/api/v1/customers GET');

      const customerCollection = $this.dbo.collection('customers');

      customerCollection.find({}, (errFindObject, resGetCustomers) => {
        if (errFindObject) {
          console.log('errFindObject = ', errFindObject);
          res.send(500, 'error');
          return;
        }

        resGetCustomers.toArray().then((foundCustomers) => {
          console.log('foundCustomers = ', foundCustomers);
          res.send(200, foundCustomers);
        });

      });
    });

    app.get('/api/v1/create-customer', async function (req, res) {
      console.log(FILE_NAME + '/api/v1/create-customer GET');

      const customerCollection = $this.dbo.collection('customers');

      customerCollection.insertOne({
        name: 'nick-' + (new Date()).getTime(),
      }, (errCreateCustomer, respCreateCustomer) => {
        if (errCreateCustomer) {
          console.log('errCreateCustomer = ', errCreateCustomer);
          res.send(500, 'error');
          return;
        }

        console.log(FILE_NAME + 'respCreateCustomer.insertedCount = ', respCreateCustomer.insertedCount);
        res.send(204);
      });
    });
  }
}

module.exports = new WebServer();
