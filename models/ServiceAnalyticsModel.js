const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ServiceAnalyticsSchema = new Schema({
  Unique_Id: {
    type: String,
    required: [false, "Unique_Id is required"],
    default: null,
  },
  ServiceCode: {
    type: String,
    required: [true, "ServiceCode is required"],
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
module.exports = ServiceAnalyticsSchema;
