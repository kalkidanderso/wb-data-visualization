import React from 'react';

const YearRangeSlider = ({ selectedYearRange, onYearRangeChange }) => {
  const handleChange = (event) => {
    const [start, end] = event.target.value;
    onYearRangeChange([start, end]);
  };

  return (
    <div>
      <label htmlFor="yearRange">Year Range:</label>
      <input
        type="range"
        id="yearRangeStart"
        min="2010"
        max="2020"
        value={selectedYearRange[0]}
        onChange={handleChange}
      />
      to
      <input
        type="range"
        id="yearRangeEnd"
        min="2010"
        max="2020"
        value={selectedYearRange[1]}
        onChange={handleChange}
      />
    </div>
  );
};

export default YearRangeSlider;