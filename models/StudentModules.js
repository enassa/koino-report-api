const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const StudentSchema = new Schema({
  Name: {
    type: String,
    required: [false, "Title is required"],
    default: null,
  },
  Gender: {
    type: String,
    required: [false, "Title is required"],
    default: null,
  },
  JHS_No: {
    type: String,
    required: [false, "Title is required"],
    default: null,
  },
  Unique_Id: {
    type: String,
    required: [false, "Title is required"],
    default: null,
  },
  First_Name: {
    type: String,
    required: [false, "Title is required"],
    default: null,
  },
  Surname: {
    type: String,
    required: [false, "Title is required"],
    default: null,
  },
  Other_Names: {
    type: String,
    required: [false, "Description is required"],
    default: null,
  },
  Email: {
    type: String,
    required: [false, "url is required"],
    default: null,
  },
  DOB: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
  BECE_Index: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
  Programme: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
  Class: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
  Residential_Status: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
  Guardians_Contact: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
  Whatsapp: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
  Call_Contact: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
  WASSCE_Index: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
  Track: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
  Region: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
  City: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
  Area: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
  House: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
  Area: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
  Guardians_Name: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
  Guardians_Email: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
  Guardians_Profession: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
  image: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
  reports: {
    type: Array,
    required: [false, " is required"],
    default: null,
  },
  Graduation_Year: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
  Current_Year: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
  Digital_Address: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
  Enrollment_Year: {
    type: String,
    required: [false, " is required"],
    default: null,
  },
});

module.exports = StudentSchema;
// Graduation_Year + Semster + SemesterYear  + StudentID
