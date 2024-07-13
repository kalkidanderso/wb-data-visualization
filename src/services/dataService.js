import axios from 'axios';

const debtApiBase = 'https://api.worldbank.org/v2/country/';
const educationApiBase = 'https://api.worldbank.org/v2/country/all/indicator/SE.XPD.TOTL.GB.ZS';

const dataService = {
  getDebtData: async (countryCode, startYear, endYear) => {
    try {
      const response = await axios.get(`${debtApiBase}/${countryCode}/indicator/DT.DOD.DECT.CD?format=json&date=${startYear}:${endYear}`);
      return response.data[1]; // Extract data from the API response
    } catch (error) {
      console.error('Error fetching debt data:', error);
      throw error;
    }
  },

  getEducationData: async (countryCode, startYear, endYear) => {
    try {
      const response = await axios.get(`${educationApiBase}?format=json&date=${startYear}:${endYear}&per_page=100`);
      return response.data[1].filter(item => item.countryiso3code === countryCode); 
    } catch (error) {
      console.error('Error fetching education data:', error);
      throw error;
    }
  },

  getCombinedData: async (countryCodes, startYear, endYear) => {
    const dataPromises = countryCodes.map(countryCode => 
      Promise.all([
        dataService.getDebtData(countryCode, startYear, endYear),
        dataService.getEducationData(countryCode, startYear, endYear)
      ]).then(([debtData, educationData]) => ({ countryCode, debtData, educationData }))
    );
    return Promise.all(dataPromises);
  }
};

export default dataService;