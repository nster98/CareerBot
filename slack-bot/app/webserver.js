
/* jshint esversion: 8 */

const FILE_NAME = __filename + ': ';
const PORT = 3000;

const express = require('express');
const exampleLib = require('./lib/example.lib.js');
const app = express();
app.use(express.json());

class WebServer {
  start(dbo, cbStart) {
    console.log(FILE_NAME + 'I\'m starting Webserver');
    this.dbo = dbo;

    this.initRoutes();

    app.listen(PORT, () => {
      console.log(`Listening on http://localhost:${PORT}`);
      return cbStart();
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
