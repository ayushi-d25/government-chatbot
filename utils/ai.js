require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = "gemini-2.5-flash";

const querySchema = {
  type: "object",
  properties: {
    category: {
      type: "string",
      description: "Dataset category, either 'District' or 'Sub-basin'.",
    },
    filters: {
      type: "array",
      description: "List of key-value filters for MongoDB.",
      items: {
        type: "object",
        properties: {
          field: { type: "string" },
          value: { type: "string" },
          operator: { type: "string" },
        },
        required: ["field", "value"],
      },
    },
  },
  required: ["category", "filters"],
};

async function generateMongoQuery(userQuery) {
  const validInfo = `
    Categories: ['District', 'Sub-basin']
    District fields: ['state', 'district', 'year', 'month', 'avg_rainfall', 'agency_name']
    Sub-basin fields: ['basin', 'subbasin', 'year', 'month', 'avg_rainfall', 'agency_name']
  `;

  const monthMap = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12
  };

  const prompt = `
    You are an expert at converting natural language into MongoDB filters.
    Turn this query into a structured JSON object that matches the schema.
    Rules:
    1. Category must be one of ['District', 'Sub-basin'].
    2. Use only valid fields for that category.
    3. Default operator is '$eq' unless comparison is implied.
    4. Convert month names (e.g. 'January') to numbers (1–12).

    ${validInfo}

    User Query: "${userQuery}"
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: querySchema,
      },
    });

    const result = JSON.parse(response.text.trim());

    for (const filter of result.filters || []) {
      if (filter.field.toLowerCase() === "month" && typeof filter.value === "string") {
        const num = monthMap[filter.value.toLowerCase()];
        if (num) filter.value = num;
      }
    }

    return result;
  } catch (err) {
    console.error("Error generating Mongo query:", err);
    return null;
  }
}

async function generateFinalResponse(userQuery, dbData) {
  const hasData = Array.isArray(dbData) && dbData.length > 0;
  let prompt;

  if (hasData) {
    const summary = JSON.stringify(dbData.slice(0, 5), null, 2);
    prompt = `
      You are a Climate and Agriculture Data Assistant.

      User asked: "${userQuery}"

      Retrieved rainfall data:
      ---
      ${summary}
      ---

      Task:
      1. Analyze the data.
      2. Write a clear, factual, and natural response focused on climate/agriculture.
      3. End with a short '--- Data Used ---' section summarizing key stats.
    `;
  } else {
    prompt = `
      You are a Climate and Agriculture Data Assistant.

      User asked: "${userQuery}"

      No matching database data found.
      Task:
      1. Politely say data isn't available.
      2. Give a relevant, informative climate-related response anyway.
      3. Suggest how to refine the query (e.g. add region or year).
    `;
  }

  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text.trim();
  } catch (err) {
    console.error("Error generating AI response:", err);
    return "Sorry, I ran into an issue while generating the response.";
  }
}

module.exports = { generateMongoQuery, generateFinalResponse };
