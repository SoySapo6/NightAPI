import { Request, Response } from 'express';
import { z } from 'zod';
import axios from 'axios';

// Tenor API key (you should use environment variables for this in production)
const TENOR_API_KEY = "AIzaSyCvq6XcbdjjMn7kVuv9bc0eLbUK90qFi6E";
const TENOR_API_URL = "https://tenor.googleapis.com/v2/search";

export async function searchGifs(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      query: z.string().min(1).max(200),
      limit: z.string().optional().transform(val => parseInt(val || '5'))
    });
    
    const { query, limit } = schema.parse(req.query);
    
    try {
      // Call Tenor API
      const response = await axios.get(TENOR_API_URL, {
        params: {
          q: query,
          key: TENOR_API_KEY,
          limit: limit
        }
      });
      
      const data = response.data;
      
      if (!data.results || !data.results.length) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'No GIFs found for this query'
        });
      }
      
      // Extract and format results
      const results = data.results.map((gif: any) => ({
        id: gif.id,
        title: gif.title,
        url: gif.media_formats.gif.url,
        preview: gif.media_formats.tinygif?.url || gif.media_formats.nanogif?.url,
        source: gif.url
      }));
      
      res.json({
        success: true,
        query,
        results
      });
      
    } catch (error: any) {
      console.error('Error searching Tenor GIFs:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to search for GIFs',
        details: error.message
      });
    }
    
  } catch (error: any) {
    console.error('Error in GIF search endpoint:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}

export async function getRandomGif(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      query: z.string().min(1).max(200)
    });
    
    const { query } = schema.parse(req.query);
    
    try {
      // Call Tenor API
      const response = await axios.get(TENOR_API_URL, {
        params: {
          q: query,
          key: TENOR_API_KEY,
          limit: 10 // Get 10 and then pick a random one
        }
      });
      
      const data = response.data;
      
      if (!data.results || !data.results.length) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'No GIFs found for this query'
        });
      }
      
      // Pick a random result
      const randomIndex = Math.floor(Math.random() * data.results.length);
      const randomGif = data.results[randomIndex];
      
      res.json({
        success: true,
        query,
        id: randomGif.id,
        title: randomGif.title,
        url: randomGif.media_formats.gif.url,
        preview: randomGif.media_formats.tinygif?.url || randomGif.media_formats.nanogif?.url,
        source: randomGif.url
      });
      
    } catch (error: any) {
      console.error('Error getting random GIF:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get a random GIF',
        details: error.message
      });
    }
    
  } catch (error: any) {
    console.error('Error in random GIF endpoint:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}