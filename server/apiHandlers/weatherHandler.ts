import { Request, Response } from 'express';
import { z } from 'zod';
import axios from 'axios';

// Mock weather data for demonstration
const weatherMockData = {
  london: {
    temperature: 12.5,
    condition: "Clear sky",
    humidity: 65,
    wind_speed: 8.3
  },
  newyork: {
    temperature: 22.8,
    condition: "Partly cloudy",
    humidity: 45,
    wind_speed: 10.1
  },
  tokyo: {
    temperature: 18.2,
    condition: "Rain",
    humidity: 80,
    wind_speed: 5.5
  },
  paris: {
    temperature: 15.7,
    condition: "Overcast",
    humidity: 70,
    wind_speed: 7.8
  },
  sydney: {
    temperature: 25.5,
    condition: "Sunny",
    humidity: 50,
    wind_speed: 12.3
  }
};

// Get current weather for a location
export async function getCurrentWeather(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      location: z.string().min(1).max(100)
    });
    
    const { location } = schema.parse(req.query);
    const normalizedLocation = location.toLowerCase().replace(/\s+/g, '');
    
    // Look up mock data for the location
    let weatherData: any;
    
    // Check if we have mock data for this location
    if (Object.keys(weatherMockData).includes(normalizedLocation)) {
      weatherData = weatherMockData[normalizedLocation as keyof typeof weatherMockData];
    } else {
      // Use default data if location not found
      weatherData = {
        temperature: 15 + Math.random() * 10,
        condition: "Clear",
        humidity: 40 + Math.floor(Math.random() * 40),
        wind_speed: 5 + Math.random() * 10
      };
    }
    
    // Return weather data
    res.json({
      location: location.charAt(0).toUpperCase() + location.slice(1),
      temperature: weatherData.temperature,
      condition: weatherData.condition,
      humidity: weatherData.humidity,
      wind_speed: weatherData.wind_speed,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Error getting current weather:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}

// Get weather forecast for a location
export async function getWeatherForecast(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      location: z.string().min(1).max(100),
      days: z.string().optional().transform(val => parseInt(val || '5'))
    });
    
    const { location, days } = schema.parse(req.query);
    
    // Generate a mock forecast
    const forecast = [];
    const normalizedLocation = location.toLowerCase().replace(/\s+/g, '');
    
    // Use mock data as a base if available
    let baseData: any;
    if (Object.keys(weatherMockData).includes(normalizedLocation)) {
      baseData = weatherMockData[normalizedLocation as keyof typeof weatherMockData];
    } else {
      baseData = {
        temperature: 15 + Math.random() * 10,
        condition: "Clear",
        humidity: 40 + Math.floor(Math.random() * 40),
        wind_speed: 5 + Math.random() * 10
      };
    }
    
    // Create forecast entries
    const conditions = ["Clear", "Partly cloudy", "Overcast", "Rain", "Thunderstorm", "Sunny"];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        temperature: {
          min: Math.round((baseData.temperature - 5 + (Math.random() * 3)) * 10) / 10,
          max: Math.round((baseData.temperature + 2 + (Math.random() * 5)) * 10) / 10,
        },
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        humidity: Math.floor(baseData.humidity + (Math.random() * 20) - 10),
        wind_speed: Math.round((baseData.wind_speed + (Math.random() * 4) - 2) * 10) / 10,
        precipitation_chance: Math.floor(Math.random() * 100)
      });
    }
    
    // Return forecast data
    res.json({
      location: location.charAt(0).toUpperCase() + location.slice(1),
      forecast_days: days,
      forecast,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Error getting weather forecast:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}
