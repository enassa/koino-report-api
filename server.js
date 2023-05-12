const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fileupload = require("express-fileupload");
const cors = require("cors");

// SET UP EXPRESS APP
const app = express();

// CONNECT TO MONGOOSE
// mongoose.connect("mongodb://localhost/student");
// mongoose.Promise = global.Promise;
// console.log("--", conection.db);
// const getConnection = async () => {
//   conection.then((res) => {
//     console.log("kkk", mongoose.res);
//     return res;
//   });
// };
// getConnection();
// module.exports = () => {
//   return getConnection();
// };
app.use(
  cors({
    origin: clientBaseUrl,
  })
);

app.get("/", (req, res) => {
  res.sendFile("./views/home.html", { root: __dirname });
});

app.use(bodyParser.json());
app.use(fileupload());
const routes = require("./routes/AllRoutes");
const { clientBaseUrl } = require("./constants");

// INITIALIZE ROUTES
app.use("/api", routes);

// ERROR HANDLING
app.use((error, req, res, next) => {
  res.status(422).send({
    error: {
      message: error.message,
      statusCode: 422,
      status: false,
    },
  });
});
let myName = 0;

// LISTEN FOR ROUTES
app.listen(process.env.PORT || "3032", (req, res) => {
  console.log("now listening on port", "3032,", req);
});
