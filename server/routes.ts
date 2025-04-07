import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

// Import API handlers
import { handleGeminiRequest } from "./apiHandlers/aiHandler";
import { 
  getRandomJoke, 
  getRandomQuote 
} from "./apiHandlers/jokesHandler";
import { 
  getCurrentWeather, 
  getWeatherForecast 
} from "./apiHandlers/weatherHandler";
import { 
  getLatestNews, 
  searchNews 
} from "./apiHandlers/newsHandler";
import { 
  getCurrencyRates, 
  convertCurrency 
} from "./apiHandlers/currencyHandler";
import { 
  generateImage, 
  resizeImage 
} from "./apiHandlers/imageHandler";
import { 
  register, 
  login,
  validateToken 
} from "./apiHandlers/authHandler";
import { 
  geocodeAddress, 
  reverseGeocode 
} from "./apiHandlers/locationHandler";
import { 
  translateText, 
  getSupportedLanguages 
} from "./apiHandlers/translateHandler";
import { 
  shortenUrl, 
  getUrlInfo 
} from "./apiHandlers/urlHandler";
import { downloadYoutubeAudio } from "./apiHandlers/ytaudioHandler";
import { downloadYoutubeVideo } from "./apiHandlers/ytvideoHandler";
import { textToSpeech } from "./apiHandlers/ttsHandler";
import { searchSoundcloud, downloadSoundcloud } from "./apiHandlers/soundcloudHandler";
import { searchGifs, getRandomGif } from "./apiHandlers/gifHandler";

// Rate limiting middleware
const rateLimit = async (req: Request, res: Response, next: () => void) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  // Skip rate limiting for development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  // Allow all requests for now (would implement proper rate limiting in production)
  if (!apiKey) {
    return next();
  }
  
  // Get user by API key
  const user = await storage.getUserByApiKey(apiKey);
  if (!user) {
    return next();
  }
  
  // Check if user has exceeded their rate limit
  const usageToday = await storage.getUserApiUsage(user.id);
  if (usageToday >= user.rate_limit) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'You have exceeded your daily API request limit'
    });
  }
  
  next();
};

// API request logger
const logApiRequest = async (req: Request, res: Response, next: () => void) => {
  const start = Date.now();
  const apiKey = req.headers['x-api-key'] as string;
  
  // Find user ID if API key provided
  let userId: number | undefined;
  if (apiKey) {
    const user = await storage.getUserByApiKey(apiKey);
    if (user) {
      userId = user.id;
    }
  }
  
  // Save original end method to intercept it
  const originalEnd = res.end;
  
  // Override end method
  // @ts-ignore - Ignore type mismatch for response interceptor
  res.end = function (chunk: any, encoding?: BufferEncoding, cb?: () => void) {
    const duration = Date.now() - start;
    
    // Log API call
    storage.logApiCall({
      user_id: userId,
      endpoint: req.path,
      status_code: res.statusCode,
      response_time: duration
    });
    
    // @ts-ignore - Apply original end method
    return originalEnd.apply(this, arguments);
  };
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Apply API middleware
  app.use('/api/*', rateLimit);
  app.use('/api/*', logApiRequest);
  
  // API Routes
  
  // 1. AI Integration
  app.get('/api/gemini', handleGeminiRequest);
  
  // 2. Entertainment
  app.get('/api/jokes/random', getRandomJoke);
  app.get('/api/quotes/random', getRandomQuote);
  
  // 3. Weather
  app.get('/api/weather/current', getCurrentWeather);
  app.get('/api/weather/forecast', getWeatherForecast);
  
  // 4. News
  app.get('/api/news/latest', getLatestNews);
  app.get('/api/news/search', searchNews);
  
  // 5. Currency
  app.get('/api/currency/rates', getCurrencyRates);
  app.get('/api/currency/convert', convertCurrency);
  
  // 6. Image Processing
  app.get('/api/image/generate', generateImage);
  app.get('/api/image/resize', resizeImage);
  
  // 7. Authentication
  app.post('/api/auth/register', register);
  app.post('/api/auth/login', login);
  app.get('/api/auth/validate', validateToken);
  
  // 8. Location
  app.get('/api/location/geocode', geocodeAddress);
  app.get('/api/location/reverse', reverseGeocode);
  
  // 9. Translation
  app.get('/api/translate', translateText);
  app.get('/api/languages', getSupportedLanguages);
  
  // 10. URL Shortener
  app.get('/api/url/shorten', shortenUrl);
  app.get('/api/url/info', getUrlInfo);
  
  // 11. YouTube Downloader
  app.get('/api/ytaudio', downloadYoutubeAudio);
  app.get('/api/ytvideo', downloadYoutubeVideo);
  
  // 12. Text-to-Speech
  app.get('/api/tts', textToSpeech);
  
  // 13. SoundCloud
  app.get('/api/soundcloud/search', searchSoundcloud);
  app.get('/api/soundcloud/download', downloadSoundcloud);
  
  // 14. Tenor GIFs
  app.get('/api/gif/search', searchGifs);
  app.get('/api/gif/random', getRandomGif);
  
  // Shortcode redirect endpoint
  app.get('/s/:code', async (req, res) => {
    const { code } = req.params;
    const url = await storage.getShortenedUrl(code);
    
    if (!url) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Short URL not found'
      });
    }
    
    // Increment click count
    await storage.incrementUrlClicks(code);
    
    // Redirect to original URL
    res.redirect(url.original_url);
  });

  return httpServer;
}
