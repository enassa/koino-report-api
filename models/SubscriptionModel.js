const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SubscriptionSchema = new Schema({
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

  ActivityDesc: {
    type: Number,
    required: [true, "AmountPaid is required"],
    default: 0,
  },
  ActivityDesc: {
    type: String,
    required: [false, "ActivityDesc is required"],
    default: null,
  },
  ServiceName: {
    type: String,
    required: [false, "ServiceName is required"],
    default: null,
  },
  CreditsLeft: {
    type: Number,
    required: [true, "CreditsLeft is required"],
    default: 0,
  },
  MaxUse: {
    type: Number,
    required: [true, "MaxUse is required"],
    default: 0,
  },
  UseCount: {
    type: Number,
    required: [true, "UseCount is required"],
    default: 0,
  },
  AccessExpiry: {
    type: Date,
    required: [true, "UseCount is required"],
    default: 0,
  },
  Date: {
    type: Date,
    required: [false, "Date is required"],
    default: null,
  },
  // timestamps: new Timestamp(),
});
// const Students = mongoose.model("student", StudentSchema);
// module.exports = Students;
module.exports = SubscriptionSchema;
