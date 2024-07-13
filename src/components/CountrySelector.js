import React from 'react';

const CountrySelector = ({ countries, selectedCountries, onCountryChange }) => {
  const handleChange = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions, (option) => option.value);
    onCountryChange(selectedOptions);
  };

  return (
    <div>
      <label htmlFor="countries">Select Countries:</label>
      <select id="countries" multiple value={selectedCountries} onChange={handleChange}>
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CountrySelector;