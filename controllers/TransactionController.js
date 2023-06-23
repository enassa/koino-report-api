const TransactionSchema = require("../models/TransactionModel");
const ReportSchema = require("../models/Reportmodel");

const mongoose = require("mongoose");

const ConnectDB = require("./DBCOnnection");
const { rateAmounts, serviceRates } = require("../constants");
exports.RecordPayment = async function (req, res) {
  const { schoolCode, schoolName, Graduation_Year, AmountPaid } = req.body;
  try {
    if (AmountPaid !== rateAmounts.downloadReport) {
      res.status(200).json({
        message:
          "An unsual activity has been detected in this account and reported",
        success: false,
        status: 200,
      });
    }

    const collectionName = `payment_${schoolCode}_${schoolName}`;

    const connection = await ConnectDB(schoolCode, schoolName, collectionName);

    const Payement = mongoose.model(collectionName, TransactionSchema);
    const Reports = mongoose.model(
      `reports_class_of_${Graduation_Year}`,
      ReportSchema
    );
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
        DownloadsLeft: serviceRates.reportsDownloads,
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

    // console.log(report);
    if (transaction) {
      res.status(201).json({
        data: { transaction, report },
        success: true,
        status: 201,
      });
      return;
    }
  } catch (error) {
    res.status(200).json({
      message: error.message,
      success: false,
      status: 200,
    });
  }
};

exports.getTransactions = async function (req, res) {
  const { schoolCode, schoolName, Unique_Id } = req.body;
  try {
    const collectionName = `payment_${schoolCode}_${schoolName}`;
    console.log(collectionName);

    const collection = await ConnectDB(schoolCode, schoolName, collectionName);
    const Payments = mongoose.model(collectionName, TransactionSchema);
    const transactions = await Payments.find({ Unique_Id });
    console.log(transactions, Unique_Id);
    if (transactions) {
      res.status(201).json({
        data: transactions,
        success: true,
        status: 201,
      });
    }
  } catch (error) {
    res.status(200).json({
      message: error.message,
      success: false,
      status: 200,
    });
  }
};
