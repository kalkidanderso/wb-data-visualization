import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, ComposedChart, PieChart, Pie, Cell
} from 'recharts';
import {
  Select, MenuItem, FormControl, InputLabel, Card, CardContent, Typography,
  Switch, FormControlLabel, Grid, Paper, Box, Drawer, IconButton, TextField,
  CircularProgress, useMediaQuery, createTheme, ThemeProvider, CssBaseline,
  AppBar, Toolbar, Button
} from '@mui/material';
import { TrendingUp, TrendingDown, Menu, Brightness7, Brightness4, GetApp } from '@mui/icons-material';

const Dashboard = () => {
  const [educationData, setEducationData] = useState([]);
  const [externalDebtData, setExternalDebtData] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState(['USA']);
  const [chartType, setChartType] = useState('line');
  const [startYear, setStartYear] = useState(2010);
  const [endYear, setEndYear] = useState(2020);
  const [showEducation, setShowEducation] = useState(true);
  const [showDebt, setShowDebt] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#3f51b5',
          },
          secondary: {
            main: '#f50057',
          },
        },
        typography: {
          fontFamily: 'Roboto, Arial, sans-serif',
        },
      }),
    [darkMode],
  );

  const countries = ['USA', 'ETH', 'BRA', 'IND', 'CHN'];
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const promises = selectedCountries.map(async (country) => {
        const [educationResponse, debtResponse] = await Promise.all([
          axios.get(`https://api.worldbank.org/v2/country/${country}/indicator/SE.XPD.TOTL.GB.ZS?date=${startYear}:${endYear}&format=json`),
          axios.get(`https://api.worldbank.org/v2/country/${country}/indicator/DT.DOD.DECT.CD?date=${startYear}:${endYear}&format=json`)
        ]);
        
        return {
          country,
          educationData: educationResponse.data[1]?.map(item => ({
            year: item.date,
            [country]: item.value
          })) || [],
          debtData: debtResponse.data[1]?.map(item => ({
            year: item.date,
            [country]: item.value
          })) || []
        };
      });

      const results = await Promise.all(promises);
      
      const combinedEducationData = results.flatMap(result => result.educationData);
      const combinedDebtData = results.flatMap(result => result.debtData);

      setEducationData(combinedEducationData.reverse());
      setExternalDebtData(combinedDebtData.reverse());
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [selectedCountries, startYear, endYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCountryChange = (event) => {
    setSelectedCountries(event.target.value);
  };

  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };

  const handleStartYearChange = (event) => {
    setStartYear(parseInt(event.target.value));
  };

  const handleEndYearChange = (event) => {
    setEndYear(parseInt(event.target.value));
  };

  const getAverageValue = (data, country) => {
    const values = data.filter(item => item[country]).map(item => item[country]);
    return values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : 'N/A';
  };

  const getTrend = (data, country) => {
    const values = data.filter(item => item[country]).map(item => item[country]);
    if (values.length < 2) return 'neutral';
    return values[values.length - 1] > values[0] ? 'up' : 'down';
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleExportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [
        ["Year", ...selectedCountries.map(c => `${c} Education`), ...selectedCountries.map(c => `${c} Debt`)].join(","),
        ...educationData.map((row, index) => 
          [row.year, 
           ...selectedCountries.map(c => row[c] || ""), 
           ...selectedCountries.map(c => externalDebtData[index]?.[c] || "")
          ].join(",")
        )
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "dashboard_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const controlsContent = (
    <Box sx={{ width: 250, padding: 2 }}>
      <Typography variant="h6" gutterBottom>Controls</Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Countries</InputLabel>
        <Select
          multiple
          value={selectedCountries}
          onChange={handleCountryChange}
          renderValue={(selected) => selected.join(', ')}
        >
          {countries.map(country => (
            <MenuItem key={country} value={country}>{country}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel>Chart Type</InputLabel>
        <Select value={chartType} onChange={handleChartTypeChange}>
          <MenuItem value="line">Line</MenuItem>
          <MenuItem value="bar">Bar</MenuItem>
          <MenuItem value="area">Area</MenuItem>
          <MenuItem value="composed">Composed</MenuItem>
          <MenuItem value="pie">Pie</MenuItem>
        </Select>
      </FormControl>
      <FormControlLabel
        control={<Switch checked={showEducation} onChange={() => setShowEducation(!showEducation)} />}
        label="Show Education"
      />
      <FormControlLabel
        control={<Switch checked={showDebt} onChange={() => setShowDebt(!showDebt)} />}
        label="Show Debt"
      />
      <TextField
        label="Start Year"
        type="number"
        value={startYear}
        onChange={handleStartYearChange}
        inputProps={{ min: 1960, max: 2023 }}
        fullWidth
        margin="normal"
      />
      <TextField
        label="End Year"
        type="number"
        value={endYear}
        onChange={handleEndYearChange}
        inputProps={{ min: startYear, max: 2023 }}
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        startIcon={<GetApp />}
        onClick={handleExportData}
        fullWidth
        sx={{ mt: 2 }}
      >
        Export Data
      </Button>
    </Box>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
          <p className="label">{`Year: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(2)} ${entry.name.includes('Education') ? '%' : 'USD'}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    let educationDataset = educationData.map(item => ({
      year: item.year,
      ...selectedCountries.reduce((acc, country) => ({
        ...acc,
        [`${country} Education`]: item[country]
      }), {})
    }));

    let debtDataset = externalDebtData.map(item => ({
      year: item.year,
      ...selectedCountries.reduce((acc, country) => ({
        ...acc,
        [`${country} Debt`]: item[country] / 1e9 // Convert to billions
      }), {})
    }));

    const combinedData = educationDataset.map((edu, index) => ({
      ...edu,
      ...debtDataset[index]
    }));

    if (chartType === 'pie') {
      const pieData = selectedCountries.map(country => ({
        name: country,
        education: getAverageValue(educationData, country),
        debt: getAverageValue(externalDebtData, country) / 1e9
      }));

      return (
        <PieChart width={400} height={400}>
          {showEducation && (
            <Pie
              data={pieData}
              dataKey="education"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={70}
              fill="#8884d8"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          )}
          {showDebt && (
            <Pie
              data={pieData}
              dataKey="debt"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={100}
              fill="#82ca9d"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          )}
          <Tooltip />
          <Legend />
        </PieChart>
      );
    }

    const ChartComponent = {
      line: LineChart,
      bar: BarChart,
      area: AreaChart,
      composed: ComposedChart
    }[chartType];

    return (
      <ChartComponent data={combinedData} style={{ cursor: 'pointer' }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis yAxisId="left" label={{ value: 'Education Expenditure (%)', angle: -90, position: 'insideLeft' }} />
        <YAxis yAxisId="right" orientation="right" label={{ value: 'External Debt (Billion USD)', angle: 90, position: 'insideRight' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {selectedCountries.map((country, index) => {
          if (showEducation) {
            const props = {
              yAxisId: "left",
              type: "monotone",
              dataKey: `${country} Education`,
              stroke: colors[index],
              fill: chartType === 'bar' ? colors[index] : `url(#colorGradient)`,
              activeDot: { r: 8 },
              animationDuration: 1500,
              animationEasing: "ease-in-out"
            };

            if (chartType === 'composed') {
              return <Line key={`${country}-education`} {...props} />;
            } else {
              return {
                line: <Line key={`${country}-education`} {...props} />,
                bar: <Bar key={`${country}-education`} {...props} />,
                area: <Area key={`${country}-education`} {...props} />
              }[chartType];
            }
          }
          return null;
        })}
        {selectedCountries.map((country, index) => {
          if (showDebt) {
            const props = {
              yAxisId: "right",
              type: "monotone",
              dataKey: `${country} Debt`,
              stroke: colors[index],
              fill: chartType === 'bar' ? colors[index] : `url(#colorGradient)`,
              activeDot: { r: 8 },
              animationDuration: 1500,
              animationEasing: "ease-in-out"
            };

            if (chartType === 'composed') {
              return <Bar key={`${country}-debt`} {...props} />;
            } else {
              return {
                line: <Line key={`${country}-debt`} {...props} />,
                bar: <Bar key={`${country}-debt`} {...props} />,
                area: <Area key={`${country}-debt`} {...props} />
              }[chartType];
            }
          }
          return null;
        })}
      </ChartComponent>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <Menu />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Education Expenditure and External Debt Dashboard
            </Typography>
            <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ padding: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={3}>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                {controlsContent}
              </Box>
            </Grid>
            <Grid item xs={12} sm={9}>
              <Card>
                <CardContent>
                <Typography variant="h5" gutterBottom>Data Visualization</Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    {selectedCountries.map((country, index) => (
                      <Grid item xs={12} sm={6} md={4} key={country}>
                        <Paper 
                          style={{ 
                            padding: '15px', 
                            backgroundColor: colors[index] + '22',
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            }
                          }}
                        >
                          <Typography variant="h6">{country}</Typography>
                          <Typography>
                            Avg. Education: {getAverageValue(educationData, country)}%
                            {getTrend(educationData, country) === 'up' ? <TrendingUp /> : <TrendingDown />}
                          </Typography>
                          <Typography>
                            Avg. Debt: ${(getAverageValue(externalDebtData, country) / 1e9).toFixed(2)}B
                            {getTrend(externalDebtData, country) === 'up' ? <TrendingUp /> : <TrendingDown />}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                  <ResponsiveContainer width="100%" height={400}>
                    {loading ? (
                      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <CircularProgress />
                      </Box>
                    ) : error ? (
                      <Typography color="error">{error}</Typography>
                    ) : (
                      renderChart()
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
        >
          {controlsContent}
        </Drawer>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;