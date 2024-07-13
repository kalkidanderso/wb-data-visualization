import React from 'react';


import { Line, Bar } from 'react-chartjs-2'; // Import Chart components 
import Chart from 'chart.js/auto'; // Import Chart.js
import { CategoryScale, LinearScale } from 'chart.js'; // Import scales

// Register the scales 
Chart.register(CategoryScale, LinearScale); 

const WorldBankChart = ({ data, type }) => {
  const chartData = {
    datasets: data.flatMap(countryData => [
      {
        label: `${countryData.countryCode} - External Debt`,
        data: countryData.debtData.map(item => ({ x: item.date, y: item.value })),
        yAxisID: 'y', 
        type, 
      },
      {
        label: `${countryData.countryCode} - Education Expenditure`,
        data: countryData.educationData.map(item => ({ x: item.date, y: item.value })),
        yAxisID: 'y1',
        type, 
      },
    ]),
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'External Debt and Education Expenditure',
      },
    },
    scales: {
      y: { 
        title: {
          display: true,
          text: 'External Debt (USD)',
        },
        position: 'left',
      },
      y1: {
        title: {
          display: true,
          text: 'Education Expenditure (% of Govt. Expenditure)',
        },
        position: 'right', 
      },
    },
  };

  const ChartComponent = type === 'line' ? Line : Bar; 

  return (
    <div>
      <ChartComponent data={chartData} options={options} /> 
    </div>
  );
};

export default WorldBankChart;