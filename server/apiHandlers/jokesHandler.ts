import { Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

// Get a random joke
export async function getRandomJoke(req: Request, res: Response) {
  try {
    // Extract optional category parameter
    const categorySchema = z.object({
      category: z.string().optional()
    }).parse(req.query);
    
    let joke;
    
    if (categorySchema.category) {
      // Get jokes by category
      const jokes = await storage.getJokesByCategory(categorySchema.category);
      
      if (jokes.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: `No jokes found in category: ${categorySchema.category}`
        });
      }
      
      // Pick a random joke from the category
      joke = jokes[Math.floor(Math.random() * jokes.length)];
    } else {
      // Get a random joke
      joke = await storage.getRandomJoke();
      
      if (!joke) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'No jokes available'
        });
      }
    }
    
    // Return joke with unique ID format
    res.json({
      id: `j${joke.id}`,
      joke: joke.joke,
      category: joke.category || 'general'
    });
  } catch (error: any) {
    console.error('Error getting random joke:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

// Get a random quote
export async function getRandomQuote(req: Request, res: Response) {
  try {
    // Extract optional author parameter
    const authorSchema = z.object({
      author: z.string().optional()
    }).parse(req.query);
    
    let quote;
    
    if (authorSchema.author) {
      // Get quotes by author
      const quotes = await storage.getQuotesByAuthor(authorSchema.author);
      
      if (quotes.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: `No quotes found by author: ${authorSchema.author}`
        });
      }
      
      // Pick a random quote from the author
      quote = quotes[Math.floor(Math.random() * quotes.length)];
    } else {
      // Get a random quote
      quote = await storage.getRandomQuote();
      
      if (!quote) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'No quotes available'
        });
      }
    }
    
    // Return quote with unique ID format
    res.json({
      id: `q${quote.id}`,
      text: quote.text,
      author: quote.author || 'Unknown'
    });
  } catch (error: any) {
    console.error('Error getting random quote:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}
