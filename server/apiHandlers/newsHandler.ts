import { Request, Response } from 'express';
import { z } from 'zod';

// Mock news data for demonstration
const newsMockData = {
  technology: [
    {
      title: "New AI Breakthrough Changes Language Understanding",
      source: "Tech Daily",
      url: "https://example.com/ai-breakthrough",
      published_at: "2023-06-15T18:30:00Z",
      summary: "Researchers have developed a new approach to natural language understanding that significantly improves performance."
    },
    {
      title: "Quantum Computing Reaches Milestone",
      source: "Future Science",
      url: "https://example.com/quantum-milestone",
      published_at: "2023-06-14T12:45:00Z",
      summary: "Scientists have achieved a new milestone in quantum computing, demonstrating sustained quantum coherence."
    },
    {
      title: "Tech Giant Announces New Smartphone",
      source: "Gadget News",
      url: "https://example.com/new-smartphone",
      published_at: "2023-06-13T09:15:00Z",
      summary: "The latest smartphone features revolutionary camera technology and improved battery life."
    }
  ],
  science: [
    {
      title: "Astronomers Discover Earth-like Planet",
      source: "Space Journal",
      url: "https://example.com/earth-like-planet",
      published_at: "2023-06-15T14:20:00Z",
      summary: "The newly discovered exoplanet has similar characteristics to Earth and is in the habitable zone."
    },
    {
      title: "New Species Found in Deep Ocean",
      source: "Marine Biology",
      url: "https://example.com/deep-ocean-species",
      published_at: "2023-06-12T11:30:00Z",
      summary: "Researchers have discovered several previously unknown species during a deep-sea expedition."
    }
  ],
  business: [
    {
      title: "Global Markets Reach Record Highs",
      source: "Financial Times",
      url: "https://example.com/market-highs",
      published_at: "2023-06-15T16:45:00Z",
      summary: "Stock markets around the world have reached new record highs amid positive economic data."
    },
    {
      title: "New Startup Secures $50M Funding",
      source: "Venture Capital News",
      url: "https://example.com/startup-funding",
      published_at: "2023-06-14T10:15:00Z",
      summary: "The AI-driven healthcare startup has secured Series B funding to expand operations."
    }
  ]
};

// Get latest news
export async function getLatestNews(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      category: z.string().optional(),
      limit: z.string().optional().transform(val => parseInt(val || '10'))
    });
    
    const { category, limit } = schema.parse(req.query);
    
    let articles: any[] = [];
    
    if (category && Object.keys(newsMockData).includes(category)) {
      // Get articles from the specified category
      articles = newsMockData[category as keyof typeof newsMockData];
    } else {
      // Get articles from all categories
      Object.values(newsMockData).forEach(categoryArticles => {
        articles = [...articles, ...categoryArticles];
      });
    }
    
    // Sort by published date (newest first)
    articles.sort((a, b) => {
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });
    
    // Limit results
    articles = articles.slice(0, limit);
    
    // Return news articles
    res.json({
      category: category || 'all',
      count: articles.length,
      articles
    });
    
  } catch (error: any) {
    console.error('Error getting latest news:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}

// Search news
export async function searchNews(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      query: z.string().min(1),
      limit: z.string().optional().transform(val => parseInt(val || '10'))
    });
    
    const { query, limit } = schema.parse(req.query);
    
    // Collect all articles
    let allArticles: any[] = [];
    Object.values(newsMockData).forEach(categoryArticles => {
      allArticles = [...allArticles, ...categoryArticles];
    });
    
    // Filter by search query (case insensitive)
    const queryLower = query.toLowerCase();
    const matchingArticles = allArticles.filter(article => {
      return (
        article.title.toLowerCase().includes(queryLower) ||
        article.summary.toLowerCase().includes(queryLower)
      );
    });
    
    // Limit results
    const limitedResults = matchingArticles.slice(0, limit);
    
    // Return search results
    res.json({
      query,
      count: limitedResults.length,
      total_results: matchingArticles.length,
      articles: limitedResults
    });
    
  } catch (error: any) {
    console.error('Error searching news:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}
