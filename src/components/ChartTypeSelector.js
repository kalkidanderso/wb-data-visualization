import React from 'react';

const ChartTypeSelector = ({ onChartTypeChange }) => {
  const handleChange = (event) => {
    onChartTypeChange(event.target.value); 
  };

  return (
    <div>
      <label htmlFor="chartType">Chart Type:</label>
      <select id="chartType" onChange={handleChange}>
        <option value="line">Line Chart</option>
        <option value="bar">Bar Chart</option>
      </select>
    </div>
  );
};

export default ChartTypeSelector;