import { Request, Response } from 'express';
import { z } from 'zod';

// Mock location data for demonstration
const locationData = {
  'New York City': {
    formatted: 'New York City, NY, USA',
    coordinates: {
      lat: 40.7128,
      lon: -74.0060
    },
    bounds: {
      ne: {lat: 40.9176, lon: -73.7004},
      sw: {lat: 40.4774, lon: -74.2591}
    }
  },
  'London': {
    formatted: 'London, UK',
    coordinates: {
      lat: 51.5074,
      lon: -0.1278
    },
    bounds: {
      ne: {lat: 51.6769, lon: 0.0056},
      sw: {lat: 51.3141, lon: -0.3441}
    }
  },
  'Tokyo': {
    formatted: 'Tokyo, Japan',
    coordinates: {
      lat: 35.6762,
      lon: 139.6503
    },
    bounds: {
      ne: {lat: 35.8178, lon: 139.9191},
      sw: {lat: 35.5478, lon: 139.5323}
    }
  },
  'Paris': {
    formatted: 'Paris, France',
    coordinates: {
      lat: 48.8566,
      lon: 2.3522
    },
    bounds: {
      ne: {lat: 48.9021, lon: 2.4699},
      sw: {lat: 48.8146, lon: 2.2241}
    }
  },
  'Sydney': {
    formatted: 'Sydney, NSW, Australia',
    coordinates: {
      lat: -33.8688,
      lon: 151.2093
    },
    bounds: {
      ne: {lat: -33.5782, lon: 151.3435},
      sw: {lat: -34.1183, lon: 150.5209}
    }
  }
};

// Convert lat/lon to closest known location
function findClosestLocation(lat: number, lon: number): any {
  let closestLocation = null;
  let minDistance = Infinity;
  
  for (const [name, data] of Object.entries(locationData)) {
    const latDiff = data.coordinates.lat - lat;
    const lonDiff = data.coordinates.lon - lon;
    const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestLocation = { name, ...data };
    }
  }
  
  return closestLocation;
}

// Geocode address to coordinates
export async function geocodeAddress(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      address: z.string().min(1).max(200)
    });
    
    const { address } = schema.parse(req.query);
    
    // Check if address matches any of our mock locations
    for (const [name, data] of Object.entries(locationData)) {
      if (address.toLowerCase().includes(name.toLowerCase())) {
        return res.json({
          query: address,
          location: data.formatted,
          coordinates: data.coordinates,
          bounds: data.bounds
        });
      }
    }
    
    // If no exact match, return the first location as fallback
    const fallbackLocation = Object.entries(locationData)[0];
    
    res.json({
      query: address,
      location: fallbackLocation[1].formatted,
      coordinates: fallbackLocation[1].coordinates,
      bounds: fallbackLocation[1].bounds,
      note: "Location approximated due to no exact match"
    });
    
  } catch (error: any) {
    console.error('Error geocoding address:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}

// Reverse geocode coordinates to address
export async function reverseGeocode(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      lat: z.string().transform(val => parseFloat(val)),
      lon: z.string().transform(val => parseFloat(val))
    });
    
    const { lat, lon } = schema.parse(req.query);
    
    // Find closest known location
    const location = findClosestLocation(lat, lon);
    
    if (!location) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No location data available'
      });
    }
    
    res.json({
      coordinates: {
        lat,
        lon
      },
      location: location.formatted,
      distance: {
        to_known_location: {
          lat: location.coordinates.lat,
          lon: location.coordinates.lon
        },
        unit: "degrees"
      }
    });
    
  } catch (error: any) {
    console.error('Error reverse geocoding:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}
