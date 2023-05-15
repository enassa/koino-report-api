const ComplainSchema = require("../models/ComplainModel");
const mongoose = require("mongoose");
const ConnectDB = require("./DBCOnnection");

exports.recordComplaint = async function (req, res) {
  const {
    schoolCode,
    schoolName,
    ServiceName,
    Unique_Id,
    Complain,
    PayementRef,
    ActivityDesc,
    AmountPaid,
    DateOfTransaction: myDate,
  } = req.body;

  const complainCollection = `complains`;
  const date = Date("DDMMYYY");
  try {
    const connection = await ConnectDB(
      schoolCode,
      schoolName,
      complainCollection
    );

    //   CONNECT TO MODELS
    const Complains = mongoose.model(complainCollection, ComplainSchema);

    //   RECORD TRANSACTION
    const complain = await Complains.create({
      ServiceName,
      Unique_Id,
      Complain,
      PayementRef,
      ActivityDesc,
      AmountPaid,
      DateOfTransaction,
      DateOfCompalin: date,
    });
    if (complain) {
      res.status(201).json({
        data: complain,
        message: "Your complaint was recorded succesfully",
        succes: true,
        status: 201,
      });
    } else {
      throw Error("We couldn't record your complaint, Please try again later");
    }
  } catch (error) {
    res.status(200).json({
      message: error.message,
      succes: false,
      status: 200,
    });
  }
};
