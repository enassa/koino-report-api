const TransactionSchema = require("../models/TransactionModel");
const SubscriptionSchema = require("../models/SubscriptionModel");
const ReportSchema = require("../models/Reportmodel");

const mongoose = require("mongoose");

const ConnectDB = require("./DBCOnnection");
const { serviceRates } = require("../constants");

exports.recordSubscription = async function (req, res) {
  try {
    const { schoolCode, schoolName, ServiceName, Unique_Id, Graduation_Year } =
      req.body;

    const transactionCollection = `payment_${schoolCode}_${schoolName}`;
    const subscriptionColelection = "subscriptions";
    const reportsColelection = `reports_class_of_${Graduation_Year}`;

    const connection = await ConnectDB(
      schoolCode,
      schoolName,
      subscriptionColelection
    );

    //   CONNECT TO MODELS
    const Subscription = mongoose.model(
      subscriptionColelection,
      SubscriptionSchema
    );
    const Payement = mongoose.model(transactionCollection, TransactionSchema);
    const Reports = mongoose.model(reportsColelection, ReportSchema);

    const dataToSave = req.body;
    const UserID = dataToSave._id;
    delete dataToSave._id;
    const date = Date("DDMMYYY");

    //   RECORD TRANSACTION
    const transactions = await Payement.create({
      ...dataToSave,
      UserID,
      Date: date,
      ActivityDesc: "Report service subscription",
    });
    ``;

    //   RECORD SUBSCRIPTION AND CREATE IF IT DOES NOT EXIST
    const date2 = new Date();
    var newDate = new Date(date2.setMonth(date2.getMonth() + 3));

    //   UPDATE REPORTS
    const updateDocForReports = {
      $set: {
        Locked: false,
        DownloadsLeft: serviceRates.reportsDownloads,
        DownlodCount: 0,
      },
    };
    const optionsReports = { upsert: true, multi: true };
    const report = await Reports.updateMany(
      { Unique_Id },
      updateDocForReports,
      optionsReports
    );

    //   UPDATE SUBSCRIPTION
    const updateDocForSubscription = {
      $set: {
        ...dataToSave,
        CreditsLeft: 3,
        MaxUse: serviceRates.reportsService,
        UseCount: 0,
        AccessExpiry: newDate,
        ActivityDesc: "Report service subscription",
      },
    };

    // upsert:false means do not create property if it does not exist
    const optionsSubsciption = { upsert: true, new: true };
    const subscriptions = await Subscription.findOneAndUpdate(
      { ServiceName, Unique_Id },
      updateDocForSubscription,
      optionsSubsciption
    );

    //   SEND RESPONSE - NEW TRANSACTION AND SUBSRCIPTION OBEJCT
    //   console.log(subscriptions);
    if (subscriptions) {
      res.status(201).json({
        data: { transactions, subscriptions },
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

exports.launchApplication = async (req, res) => {
  try {
    const { schoolCode, schoolName, ServiceName, Unique_Id, _id } = req.body;
    const subscriptionColelection = "subscriptions";

    const connection = await ConnectDB(
      schoolCode,
      schoolName,
      subscriptionColelection
    );

    //   CONNECT TO MODELS
    const Subscription = mongoose.model(
      subscriptionColelection,
      SubscriptionSchema
    );
    const oldSubscription = await Subscription.findOne({
      ServiceName,
      Unique_Id,
    });

    let newUseCount, newCreditsLeft;
    // console.log(oldSubscription);
    if (oldSubscription && oldSubscription.CreditsLeft !== 0) {
      newCreditsLeft = oldSubscription.CreditsLeft - 1;
      newUseCount = oldSubscription.UseCount + 1;
    } else {
      res.status(200).json({
        message: "An usual activity has been detected and reported",
        success: false,
        status: 200,
      });
      return;
    }

    const date2 = new Date();
    var newDate = new Date(date2.setMonth(date2.getMonth() + 3));
    const updateDoc = {
      $set: {
        CreditsLeft: newCreditsLeft,
        UseCount: newUseCount,
      },
    };

    // upsert:false means do not create property if it does not exist
    const options = { upsert: false, new: true };
    const updatedSubscription = await Subscription.findOneAndUpdate(
      { ServiceName, Unique_Id },
      updateDoc,
      options
    );
    res.status(201).json({
      data: { subscriptions: updatedSubscription },
      success: true,
      status: 201,
    });
  } catch (error) {
    res.status(200).json({
      message: error.message,
      success: false,
      status: 200,
    });
  }
};
