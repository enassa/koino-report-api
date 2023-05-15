const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const TransactionSchema = new Schema({
  PayementRef: {
    type: String,
    required: [false, "FormNumber is required"],
    default: null,
  },
  Unique_Id: {
    type: String,
    required: [false, "Unique_Id is required"],
    default: null,
  },
  FormNumber: {
    type: String,
    required: [false, "Semester is required"],
    default: null,
  },
  Semester: {
    type: String,
    required: [false, "Semester is required"],
    default: null,
  },
  File_Name: {
    type: String,
    required: [false, "File_Name is required"],
    default: null,
  },
  AmountPaid: {
    type: Number,
    required: [true, "AmountPaid is required"],
    default: 0,
  },
  PaymentMode: {
    type: String,
    required: [false, "PaymentMode is required"],
    default: null,
  },
  ActivityDesc: {
    type: String,
    required: [false, "PaymentMode is required"],
    default: null,
  },
  UserID: {
    type: String,
    required: [false, "PaymentMode is required"],
    default: null,
  },
  ReportID: {
    type: String,
    required: [false, "PaymentMode is required"],
    default: null,
  },
  Date: {
    type: Date,
    required: [false, "PaymentMode is required"],
    default: null,
  },
  // timestamps: new Timestamp(),
});
// const Students = mongoose.model("student", StudentSchema);
// module.exports = Students;
module.exports = TransactionSchema;
