const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ComplainSchema = new Schema({
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
  Complain: {
    type: String,
    required: [true, "AmountPaid is required"],
    default: 0,
  },
  ActivityDesc: {
    type: String,
    required: [true, "AmountPaid is required"],
    default: 0,
  },
  AmountPaid: {
    type: Number,
    required: [true, "AmountPaid is required"],
    default: 0,
  },
  DateOfCompalin: {
    type: Date,
    required: [false, "DateOfCompalin is required"],
    default: null,
  },
  DateOfTransaction: {
    type: Date,
    required: [false, "DateOfTransaction is required"],
    default: null,
  },
  // timestamps: new Timestamp(),
});
// const Students = mongoose.model("student", StudentSchema);
// module.exports = Students;
module.exports = ComplainSchema;
