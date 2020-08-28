// webserver.js
// Code to start and communicate with the web server

/* jshint esversion: 8 */

const FILE_NAME = __filename + ': ';
const PORT = 3000;

const express = require('express');
const exampleLib = require('./lib/example.lib.js');
const app = express();
app.use(express.json());

const message = require('./message');
const routes = require('./routes/customers.route');

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

          const customerCollection = $this.dbo.collection('customers');

          await routes.orderPizza(payload, customerCollection, res);
        }
      }
    });
  }

  initRoutes() {
    const $this = this;


    app.get('/slack/events', async function (req, res) {
      console.log(FILE_NAME + '/slack/events GET');

      exampleLib.doSomething('slack', req.body, (errDoSomethign, respDoSomething) => {
        if (errDoSomethign) {
          log.error(msgHdr + 'errDoSomethign = ', errDoSomethign);
          res.send(500);
        }

        // respDoSomething has jsonRespData that I can do somethign if necessary
        res.send(200);

      });
    });

    app.get('/api/messages', async function (req, res) {
      console.log(FILE_NAME + '/api/messages GET');

      exampleLib.doSomething('teams', req.body, (errDoSomethign, respDoSomething) => {
        if (errDoSomethign) {
          log.error(msgHdr + 'errDoSomethign = ', errDoSomethign);
          res.send(500);
        }

        // respDoSomething has jsonRespData that I can do somethign if necessary
        res.send(200);
      });
    });

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
        size: null,
        toppings: null,
        address: null,
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
