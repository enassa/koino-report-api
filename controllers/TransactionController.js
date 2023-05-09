const TransactionSchema = require("../models/TransactionModel");
const ReportSchema = require("../models/Reportmodel");

const mongoose = require("mongoose");

const ConnectDB = require("./DBCOnnection");
exports.RecordPayment = async function (req, res) {
  const { schoolCode, schoolName, Graduation_Year } = req.body;
  console.log(req.body);
  const collectionName = `payment_${schoolCode}_${schoolName}`;
  console.log(collectionName);
  // return;
  // const Reports = mongoose.model(className, ReportSchema);
  const collection = await ConnectDB(schoolCode, schoolName, collectionName);
  const Payement = mongoose.model(collectionName, TransactionSchema);
  const Reports = mongoose.model(
    `reports_class_of_${Graduation_Year}`,
    ReportSchema
  );
  // console.log(Payement, collection, mongoose.models, Unique_Id);
  const dataToSave = req.body;
  const ReportID = dataToSave._id;
  delete dataToSave._id;
  const date = Date("DDMMYYY");
  const transaction = await Payement.create({
    ...dataToSave,
    ReportID,
    Date: date,
  });
  const date2 = new Date();
  var newDate = new Date(date2.setMonth(date2.getMonth() + 3));

  const updateDoc = {
    $set: {
      Locked: false,
      DownloadsLeft: 3,
      AccessExpiry: newDate,
    },
  };
  // upsert:false means do not create property if it does not exist
  const options = { upsert: false, new: true };
  const report = await Reports.findOneAndUpdate(
    { _id: ReportID },
    updateDoc,
    options
  );

  console.log(report);
  if (transaction) {
    res.status(201).json({
      data: { transaction, report },
      success: true,
      status: 201,
    });
  }
};

exports.getTransactions = async function (req, res) {
  const { schoolCode, schoolName, Unique_Id } = req.body;

  const collectionName = `payment_${schoolCode}_${schoolName}`;
  console.log(collectionName);
  // return;
  // const Reports = mongoose.model(className, ReportSchema);
  const collection = await ConnectDB(schoolCode, schoolName, collectionName);
  const Payments = mongoose.model(collectionName, TransactionSchema);
  // console.log(Payments, collection, mongoose.models, Unique_Id);
  const transactions = await Payments.find({ Unique_Id });
  console.log(transactions, Unique_Id);
  if (transactions) {
    res.status(201).json({
      data: transactions,
      success: true,
      status: 201,
    });
  }
};

// Payement_Ref: {
//   type: String,
//   required: [false, "FormNumber is required"],
//   default: null,
// },
// Unique_Id: {
//   type: String,
//   required: [false, "Unique_Id is required"],
//   default: null,
// },
// Form_Number: {
//   type: String,
//   required: [false, "Semester is required"],
//   default: null,
// },
// Semester: {
//   type: String,
//   required: [false, "Semester is required"],
//   default: null,
// },
// File_Name: {
//   type: String,
//   required: [false, "File_Name is required"],
//   default: null,
// },
// Amount_Paid: {
//   type: Number,
//   required: [true, "AmountPaid is required"],
//   default: 0,
// },
// PaymentMode: {
//   type: String,
//   required: [false, "PaymentMode is required"],
//   default: null,
// },
