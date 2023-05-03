const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ReportSchema = new Schema({
  FormNumber: {
    type: String,
    required: [false, "FormNumber is required"],
    default: null,
  },
  Unique_Id: {
    type: String,
    required: [false, "Unique_Id is required"],
    default: null,
  },
  Semester: {
    type: String,
    required: [false, "Semester is required"],
    default: null,
  },
  File_Name: {
    type: String,
    required: [false, "Title is required"],
    default: null,
  },
  Graduation_Year: {
    type: String,
    required: [false, "Graduation_Year is required"],
    default: null,
  },
  AccessExpiry: {
    type: Date,
    required: [true, "AccessExpiry is required"],
    default: null,
  },
  AmountPaid: {
    type: Number,
    required: [true, "AmountPaid is required"],
    default: 0,
  },
  DownloadCount: {
    type: Number,
    required: [true, "DownloadCount is required"],
    default: null,
  },
  DownloadsLeft: {
    type: Number,
    required: [true, "DownloadsLeft is required"],
    default: null,
  },
  Locked: {
    type: Boolean,
    required: [true, "Locked is required"],
    default: true,
  },

  // timestamps: true,
});
// const Students = mongoose.model("student", StudentSchema);
// module.exports = Students;
module.exports = ReportSchema;
