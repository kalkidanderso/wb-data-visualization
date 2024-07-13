import axios from 'axios';

// Fetch education expenditure data
export const fetchEducationData = async (countryCode, startYear, endYear) => {
  const response = await axios.get(`https://api.worldbank.org/v2/country/${countryCode}/indicator/SE.XPD.TOTL.GB.ZS?date=${startYear}:${endYear}&format=json`);
  const data = response.data[1];  // The actual data is in the second element of the response array
  return data.map(item => ({
    year: item.date,
    value: item.value
  }));
};

// Fetch external debt data
export const fetchDebtData = async (countryCode, startYear, endYear) => {
  const response = await axios.get(`https://api.worldbank.org/v2/country/${countryCode}/indicator/DT.DOD.DECT.CD?date=${startYear}:${endYear}&format=json`);
  const data = response.data[1];  // The actual data is in the second element of the response array
  return data.map(item => ({
    year: item.date,
    value: item.value
  }));
};
