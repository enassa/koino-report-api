const ServiceAnalyticsSchema = require("../models/ServiceAnalyticsModel");
const mongoose = require("mongoose");
const ConnectDB = require("./DBCOnnection");

exports.recordInActiveServiceClick = async (req, res) => {
  const { schoolCode, schoolName, ServiceCode, Unique_Id } = req.body;
  const analyticsCollection = "analytics";
  try {
    const connection = await ConnectDB(
      schoolCode,
      schoolName,
      analyticsCollection
    );

    //   CONNECT TO MODELS
    const ServiceAnalytics = mongoose.model(
      analyticsCollection,
      ServiceAnalyticsSchema
    );
    const analytic = await ServiceAnalytics.create({
      ServiceCode,
      Unique_Id,
      Date: Date("DDMMYYY"),
    });

    if (analytic) {
      res.status(200).json({
        data: {},
        success: true,
        status: 200,
      });
      return;
    } else {
      throw Error("Could not record analytic");
    }
  } catch (error) {
    res.status(200).json({
      message: error.message,
      status: 200,
      success: false,
    });
  }
};
