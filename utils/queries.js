const RainfallRecord = require("../models/rainfallRecord.js");

const queryRainfall = async (filters = {}) => {
  const mongoFilters = {};

  if (filters.category) mongoFilters.category = filters.category;
  if (filters.state) mongoFilters.state = filters.state;
  if (filters.district) mongoFilters.district = filters.district;
  if (filters.basin) mongoFilters.basin = filters.basin;
  if (filters.subbasin) mongoFilters.subbasin = filters.subbasin;
  if (filters.year) mongoFilters.year = Number(filters.year);
  if (filters.month) mongoFilters.month = Number(filters.month);
  if (filters.agency_name) mongoFilters.agency_name = filters.agency_name;

  // limit results to avoid overloading the response
  return await RainfallRecord.find(mongoFilters).limit(100);
};

module.exports = {
  queryRainfall
};
