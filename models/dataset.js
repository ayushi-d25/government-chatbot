const mongoose = require("mongoose");

const datasetSchema = new mongoose.Schema({
  title: String,
  description: String,
  domain: { type: String, default: "Water Resources" },
  type: { type: String, enum: ["District-wise", "Sub-basin-wise"] },
  source: String,
  organization: [String],
  sectors: [String],
  dataset_id: String,
  collection_name: { type: String, default: "rainfallrecords" },
  last_updated: Date,
  api_url: String
});

module.exports = mongoose.model("Dataset", datasetSchema);
