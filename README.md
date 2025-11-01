# Rainfall Data API

A Node.js/Express backend API that provides access to historical rainfall data across districts and sub-basins in India. The API uses AI-powered natural language processing to convert user queries into MongoDB filters.

## Tech Stack

- Node.js & Express
- MongoDB with Mongoose
- Google's Gemini AI
- data.gov.in APIs

## Prerequisites

- Node.js 18+
- MongoDB database
- Google Cloud Gemini API key
- data.gov.in API keys

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root with the following variables:
```env
MONGO_URI=your_mongodb_connection_string
DATA_GOV_API_KEY_DISTRICT=your_data_gov_district_api_key
DATA_GOV_API_KEY_SUBBASIN=your_data_gov_subbasin_api_key
GEMINI_API_KEY=your_gemini_api_key
```

## Database Setup

Run the data ingestion script to populate your MongoDB database with rainfall records:

```bash
node scripts/injestRainfall.js
```

This will fetch data from data.gov.in and create two collections:
- `rainfallrecords`: Contains individual rainfall measurements
- `datasets`: Contains metadata about the data sources

## API Endpoints

### POST /api/chat
Natural language query endpoint for rainfall data.

**Request Body:**
```json
{
  "message": "Show me rainfall data for Maharashtra in 2022"
}
```

**Response:**
```json
{
  "structuredQuery": {
    "category": "District",
    "filters": [
      {
        "field": "state",
        "value": "Maharashtra"
      },
      {
        "field": "year",
        "value": 2022
      }
    ]
  },
  "data": [...],
  "answer": "Natural language response with analysis..."
}
```

## Data Models

### RainfallRecord
- dataset_id: String
- category: "District" | "Sub-basin"
- state: String
- district: String
- basin: String
- subbasin: String
- date: Date
- year: Number
- month: Number
- avg_rainfall: Number
- agency_name: String
- source: String

### Dataset
- title: String
- description: String
- domain: String
- type: "District-wise" | "Sub-basin-wise"
- source: String
- organization: [String]
- sectors: [String]
- dataset_id: String
- last_updated: Date
- api_url: String

## Running Locally

Start the development server:

```bash
node server.js
```

The API will be available at `http://localhost:5000`.

## Testing

Example queries to test the API:

```bash
# Get rainfall data for a specific district
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What was the rainfall in Mumbai during monsoon 2023?"}'

# Get sub-basin data
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me rainfall data for the Ganga basin"}'
```

## Project Structure

```
├── models/
│   ├── dataset.js         # Dataset schema
│   └── rainfallRecord.js  # Rainfall records schema
├── scripts/
│   └── injestRainfall.js  # Data ingestion script
├── utils/
│   ├── ai.js             # AI query processing
│   └── queries.js        # MongoDB queries
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
├── package.json          # Project dependencies
├── README.md             # This file
└── server.js             # Express server setup
```

## Deployment

1. Set up a MongoDB Atlas cluster
2. Configure environment variables on your hosting platform
3. Deploy the Node.js application
4. Ensure CORS settings match your frontend domain

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 400: Bad request (invalid query)
- 500: Server error

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

ISC License

## References

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [data.gov.in API Documentation](https://data.gov.in/apis)
- [Google Gemini AI Documentation](https://ai.google.dev/)