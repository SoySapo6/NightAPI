import { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import crypto from 'crypto';

// Generate a short code for URLs
function generateShortCode(): string {
  return crypto.randomBytes(4).toString('hex').substring(0, 6);
}

// Shorten URL
export async function shortenUrl(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      url: z.string().url(),
      customCode: z.string().min(3).max(20).optional()
    });
    
    const { url, customCode } = schema.parse(req.query);
    
    // Generate or use custom code
    const code = customCode || generateShortCode();
    
    // Check if code already exists
    if (customCode) {
      const existingUrl = await storage.getShortenedUrl(customCode);
      if (existingUrl) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Custom code already in use'
        });
      }
    }
    
    // Store the shortened URL
    const shortenedUrl = await storage.createShortenedUrl({
      original_url: url,
      code
    });
    
    // Get hostname for URL generation
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    
    // Return shortened URL info
    res.json({
      original_url: shortenedUrl.original_url,
      short_url: `${baseUrl}/s/${shortenedUrl.code}`,
      code: shortenedUrl.code,
      created_at: shortenedUrl.created_at.toISOString(),
      clicks: shortenedUrl.clicks
    });
    
  } catch (error: any) {
    console.error('Error shortening URL:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}

// Get URL info
export async function getUrlInfo(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      code: z.string().min(3).max(20)
    });
    
    const { code } = schema.parse(req.query);
    
    // Get URL info
    const url = await storage.getShortenedUrl(code);
    
    if (!url) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Short URL not found'
      });
    }
    
    // Get hostname for URL generation
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    
    // Return URL info
    res.json({
      original_url: url.original_url,
      short_url: `${baseUrl}/s/${url.code}`,
      code: url.code,
      created_at: url.created_at.toISOString(),
      clicks: url.clicks
    });
    
  } catch (error: any) {
    console.error('Error getting URL info:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}
