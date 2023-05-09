const mongoose = require("mongoose");

const ConnectDB = async (schoolCode, schoolName, collectionName) => {
  let connectionUrl = `mongodb://localhost/${schoolCode}_${schoolName}`;
  let connected = mongoose.connect(connectionUrl);
  mongoose.Promise = global.Promise;
  connected.then(() => {
    const con = mongoose.createConnection(connectionUrl);
    con.on("open", () => {
      console.log("Connected to Database");
      mongoose.connection.db
        .listCollections({ name: collectionName })
        .next((err, collection) => {
          if (collection) {
            console.log("collection found");
            return collection;
            return;
          } else {
            console.log("collection does not exist");
            return false;
          }
        });
    });
  });
};

module.exports = ConnectDB;
