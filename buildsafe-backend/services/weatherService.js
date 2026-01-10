// services/weatherService.js
const axios = require('axios');
const WeatherData = require('../models/WeatherData');

exports.getWeatherByCoordinates = async (latitude, longitude) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.WEATHER_API_KEY}&units=metric`;

  try {
    const response = await axios.get(url);
    const weather = {
      location: { latitude, longitude },
      temperature: response.data.main.temp,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed || 0,
      precipitation: response.data.rain?.['1h'] || 0,
      conditions: response.data.weather[0].main
    };

    const weatherDoc = new WeatherData(weather);
    await weatherDoc.save();
    return weather;
  } catch (error) {
    console.error('Weather API error:', error.message);
    // Fallback safe values
    return {
      location: { latitude, longitude },
      temperature: 20,
      humidity: 50,
      windSpeed: 0,
      precipitation: 0,
      conditions: 'Clear'
    };
  }
};