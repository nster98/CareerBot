// db.js
// Code to connect to the mongo database

/* jshint esversion: 8 */

const MongoClient = require('mongodb').MongoClient;
const path = require('path');

const DATABASE_NAME = 'testDB';
const FILE_NAME = __filename + ': ';

const password = "E1CjvoChu5owMkQU";

//const ENV_FILE = path.join(__dirname, '.env');
//require('dotenv').config({ path: `${__dirname}/.env` });

let mongo_url = `mongodb+srv://main_user:${password}@career-place-test-clust.u796u.mongodb.net/${DATABASE_NAME}?retryWrites=true&w=majority`;
console.log('process.env.LOCALDB = .' + process.env.LOCALDB + '.');
if (process.env.LOCALDB) {
  mongo_url = 'mongodb://localhost:27017/' + DATABASE_NAME;
}

class DB {
    start(cbStart) {
        console.log(FILE_NAME + 'I\'m starting DB');

        console.log('mongo_url = ', mongo_url);
        const mongo_client = new MongoClient(mongo_url, { useUnifiedTopology: true });
        var mongoConnect = mongo_client.connect();

        mongoConnect.then((dbConnection) => {
            var dbo = mongo_client.db(DATABASE_NAME);
            console.log(FILE_NAME + 'DB Started');
            return cbStart(null, dbo);
        }, (errConnect) => {
            console.error(FILE_NAME + 'error connecting to db, errConnect = ', errConnect);
            return cbStart(errConnect);
        });
    }
}

module.exports = new DB();