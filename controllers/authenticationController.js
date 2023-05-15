const mongoose = require("mongoose");
const StudentSchema = require("../models/StudentModules");
const SubscriptionSchema = require("../models/SubscriptionModel");

const ReportSchema = require("../models/Reportmodel");
const ConnectDB = require("./DBCOnnection");

exports.loginUser = async (req, res) => {
  // console.log(req.socket.localPort);
  const { extraInfo, data } = req.body;
  console.log(extraInfo, data);
  let schoolCode = extraInfo.schoolCode;
  let schoolName = extraInfo.schoolName;
  let className = extraInfo.className;
  try {
    await ConnectDB(schoolCode, schoolName, className);
    const Student = mongoose.model(extraInfo.className, StudentSchema);

    if (!data?.indexNumber || !data?.password) {
      throw Error("All fields are required");
    }
    const student = await Student.findOne({ BECE_Index: data.indexNumber });
    // const student = await Student.findOne({ Unique_Id: "1538570" });
    if (!student) {
      throw Error("Your index number is invalid");
    }

    if (student.Unique_Id !== data.password) {
      throw Error("Your password  is invalid");
    }
    const subscriptionColelection = "subscriptions";

    const Subscription = mongoose.model(
      subscriptionColelection,
      SubscriptionSchema
    );
    const subscriptions = await Subscription.find({
      Unique_Id: student.Unique_Id,
    });
    console.log(subscriptions);

    res.status(201).json({
      data: {
        userData: student,
        subscriptions: !!subscriptions ? subscriptions : [],
      },
      extraInfo,
      success: true,
      status: 201,
    });
    return;
  } catch (error) {
    res.status(200).json({
      error: error.message,
      success: false,
      status: 200,
    });
    return;
  }
};
