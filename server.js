const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { queryRainfall } = require("./utils/queries.js");
const { generateMongoQuery, generateFinalResponse } = require("./utils/ai.js");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/chat", async (req, res) => {
  const userQuery = req.body.message;

  try {
    const structured = await generateMongoQuery(userQuery);
    if (!structured) return res.status(400).json({ error: "Query extraction failed." });

    const filters = {};
    structured.filters.forEach(f => filters[f.field] = f.value);

    const dbResult = await queryRainfall({
      ...filters,
      category: structured.category,
    });

    const aiResponse = await generateFinalResponse(userQuery, dbResult);

    res.json({
      structuredQuery: structured,
      data: dbResult,
      answer: aiResponse,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    app.listen(5000, () => console.log("Server running on port 5000 🚀"));
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

startServer();
