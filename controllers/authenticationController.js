const mongoose = require("mongoose");
const StudentSchema = require("../models/StudentModules");
const ReportSchema = require("../models/Reportmodel");
const ConnectDB = require("./DBCOnnection");

exports.loginUser = async (req, res) => {
  console.log(req.socket.localPort);
  const { extraInfo, data } = req.body;
  console.log(extraInfo, data);
  let schoolCode = extraInfo.schoolCode;
  let schoolName = extraInfo.schoolName;
  let className = extraInfo.className;

  await ConnectDB(schoolCode, schoolName, className);
  const Student = mongoose.model(extraInfo.className, StudentSchema);

  try {
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

    res.status(201).json({
      data: student,
      extraInfo,
      success: true,
      status: 201,
    });
  } catch (error) {
    res.status(200).json({
      error: error.message,
      success: false,
      status: 200,
    });
  }

  // res.send({
  //   data: data,
  //   extraInfo,
  // });

  // return;
};
