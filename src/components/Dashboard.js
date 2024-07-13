import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, ComposedChart
} from 'recharts';
import {
  Select, MenuItem, FormControl, InputLabel, Card, CardContent, Typography,
  Switch, FormControlLabel, Grid, Paper, Box, Drawer, IconButton, TextField,
  CircularProgress,
  useMediaQuery,
  createTheme,
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar
} from '@mui/material';
import { TrendingUp, TrendingDown, Menu, Brightness7, Brightness4 } from '@mui/icons-material';

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
  
    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        const promises = selectedCountries.map(async (country) => {
          const educationResponse = await fetch(`https://api.worldbank.org/v2/country/${country}/indicator/SE.XPD.TOTL.GB.ZS?date=${startYear}:${endYear}&format=json`);
          const debtResponse = await fetch(`https://api.worldbank.org/v2/country/${country}/indicator/DT.DOD.DECT.CD?date=${startYear}:${endYear}&format=json`);
          
          const educationData = await educationResponse.json();
          const debtData = await debtResponse.json();
          
          return {
            country,
            educationData: educationData[1]?.map(item => ({
              year: item.date,
              [country]: item.value
            })) || [],
            debtData: debtData[1]?.map(item => ({
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
        setLoading(false);
      };
  
      fetchData();
    }, [selectedCountries, startYear, endYear]);
  
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
      </Box>
    );
  
    const renderChart = () => {
        const data = showEducation ? educationData : externalDebtData;
      
        const ChartComponent = {
          line: LineChart,
          bar: BarChart,
          area: AreaChart,
          composed: ComposedChart
        }[chartType];
      
        return (
          <ChartComponent data={data} style={{ cursor: 'pointer' }}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            {selectedCountries.map((country, index) => {
              const props = {
                key: country,
                type: "monotone",
                dataKey: country,
                stroke: colors[index],
                fill: chartType === 'bar' ? colors[index] : `url(#colorGradient)`,
                activeDot: { r: 8 },
                animationDuration: 1500,
                animationEasing: "ease-in-out"
              };
      
              if (chartType === 'composed') {
                return (
                  <React.Fragment key={country}>
                    <Bar {...props} />
                    <Line {...props} />
                  </React.Fragment>
                );
              } else {
                return {
                  line: <Line {...props} />,
                  bar: <Bar {...props} />,
                  area: <Area {...props} />
                }[chartType];
              }
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