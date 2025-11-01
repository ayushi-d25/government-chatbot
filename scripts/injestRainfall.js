const mongoose = require("mongoose");
const axios = require("axios");
const dotenv = require("dotenv");
const RainfallRecord = require("../models/rainfallRecord.js");
const Dataset = require("../models/dataset.js");

dotenv.config();

const ingestData = async (url, type) => {
  const { data } = await axios.get(url);

  const records = data.records.map((r) => ({
    dataset_id: data.index_name,
    category: type === "district" ? "District" : "Sub-basin",
    state: r.State || null,
    district: r.District || null,
    basin: r.Basin || null,
    subbasin: r.Subbasin || null,
    date: new Date(r.Date),
    year: Number(r.Year),
    month: Number(r.Month),
    avg_rainfall: Number(r.Avg_rainfall),
    agency_name: r.Agency_name || null,
  }));

  await RainfallRecord.insertMany(records);

  await Dataset.create({
    title: data.title,
    description: data.desc,
    domain: "Water Resources",
    type: type === "district" ? "District-wise" : "Sub-basin-wise",
    source: "data.gov.in",
    organization: data.org,
    sectors: data.sector,
    dataset_id: data.index_name,
    last_updated: new Date(data.updated_date),
    api_url: url,
  });

  console.log(`${type} data inserted successfully ✅`);
};

async function runIngestion() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const datasets = [
      {
        url: `https://api.data.gov.in/resource/6c05cd1b-ed59-40c2-bc31-e314f39c6971?api-key=${process.env.DATA_GOV_API_KEY_DISTRICT}&format=json`,
        type: "district",
      },
      {
        url: `https://api.data.gov.in/resource/da428447-700a-41e9-a56a-d7855ffb672f?api-key=${process.env.DATA_GOV_API_KEY_SUBBASIN}&format=json`,
        type: "subbasin",
      },
    ];

    for (const { url, type } of datasets) {
      await ingestData(url, type);
    }
  } catch (err) {
    console.error("Error during data ingestion:", err);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed");
  }
}

runIngestion();


module.exports = { ingestData };
