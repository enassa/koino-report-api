// const Student = require("../models/StudentModules");
const StudentSchema = require("../models/StudentModules");
const mongoose = require("mongoose");
// const getConnection = require("../app");
const express = require("express");
const router = express.Router();
const reader = require("xlsx");
const excelToJson = require("convert-excel-to-json");
var path = require("path");
var root = path.dirname(require.main.filename);
var tmp = require("tmp");
var fs = require("fs");
const multer = require("multer");
const { response } = require("express");
const { file } = require("tmp");

let Student;
// var xlsx = require("node-xlsx").default;
// GET SURVEYS
// CONNECT TO MONGOOSE
// let connection = mongoose.connect("mongodb://localhost/student");
// module.exports = conection;
// mongoose.Promise = global.Promise;
// getConnection().then((res) => {
//   console.log(mongoose.res?.db);
// });

var studentDataController = require("../controllers/studentDataController");
var reportsControler = require("../controllers/reportController");
var authenticationControlller = require("../controllers/authenticationController");
router.get("/students/:id", (req, res, next) => {
  console.log("hello");
  res.send({ type: "GET" });
});

// ADD SURVEY
router.post("/students", studentDataController.uploadStudentData);

router.post("/reports", reportsControler.uploadReportCards);

// UPDATE SURVEY
router.put("/students/:id", (req, res, next) => {
  res.send({ type: "PUT" });
});

// DELETE SURVEY
router.delete("/students/:id", (req, res, next) => {
  Student.findByIdAndRemove();
  res.send({ type: "DELETE" });
});

// REPORT ACCESS
router.post("/login", authenticationControlller.loginUser);

module.exports = router;
