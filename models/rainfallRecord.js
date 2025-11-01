const mongoose = require("mongoose");

const rainfallRecordSchema = new mongoose.Schema({
  dataset_id: String,
  category: {
    type: String,
    enum: ["District", "Sub-basin"],
    required: true,
  },
  state: String,
  district: String,
  basin: String,
  subbasin: String,
  date: { type: Date, required: true },
  year: Number,
  month: Number,
  avg_rainfall: Number,
  agency_name: String,
  source: { type: String, default: "data.gov.in" },
});

module.exports = mongoose.model("RainfallRecord", rainfallRecordSchema);
