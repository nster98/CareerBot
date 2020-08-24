
/* jshint esversion: 8 */

const MongoClient = require('mongodb').MongoClient;

const DATABASE_NAME = 'testDB';
const FILE_NAME = __filename + ': ';

let mongo_url = `mongodb+srv://main_user:${process.env.MONGO_PASSWORD}@career-place-test-clust.u796u.mongodb.net/${DATABASE_NAME}?retryWrites=true&w=majority`;
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
      // var collection = dbConnection.collection('botInfo');

      //collection.insertOne({ channel: process.env.CHANNEL });
      // collection.updateOne({ channel: /[\s\S]*/ }, { $set: { channel: process.env.CHANNEL } });

      console.log(FILE_NAME + 'DB Started');

      return cbStart(null, dbo);
    }, (errConnect) => {
      console.error(FILE_NAME + 'error connecting to db, errConnect = ', errConnect);
      return cbStart(errConnect);
    });
  }
}

module.exports = new DB();
