const mongoose = require("mongoose");

const ConnectDB = async (schoolCode, schoolName, className) => {
  let connectionUrl = `mongodb://localhost/${schoolCode}_${schoolName}`;
  let connected = mongoose.connect(connectionUrl);
  mongoose.Promise = global.Promise;
  connected.then(() => {
    const con = mongoose.createConnection(connectionUrl);
    con.on("open", () => {
      console.log("Connected to Database");
      mongoose.connection.db
        .listCollections({ name: className })
        .next((err, names) => {
          if (names) {
            console.log("Class found");
            return true;
            return;
          } else {
            console.log("Sorry this class has already been created");
            return false;
          }
        });
    });
  });
};

module.exports = ConnectDB;
