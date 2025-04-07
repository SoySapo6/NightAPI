import { users, type User, type InsertUser } from "@shared/schema";
import { jokes, type Joke, type InsertJoke } from "@shared/schema";
import { quotes, type Quote, type InsertQuote } from "@shared/schema";
import { shortenedUrls, type ShortenedUrl, type InsertShortenedUrl } from "@shared/schema";
import { apiLogs, type ApiLog, type InsertApiLog } from "@shared/schema";
import crypto from 'crypto';

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByApiKey(apiKey: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Joke methods
  getJoke(id: number): Promise<Joke | undefined>;
  getRandomJoke(): Promise<Joke | undefined>;
  getJokesByCategory(category: string): Promise<Joke[]>;
  createJoke(joke: InsertJoke): Promise<Joke>;
  
  // Quote methods
  getQuote(id: number): Promise<Quote | undefined>;
  getRandomQuote(): Promise<Quote | undefined>;
  getQuotesByAuthor(author: string): Promise<Quote[]>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  
  // URL shortening methods
  getShortenedUrl(code: string): Promise<ShortenedUrl | undefined>;
  createShortenedUrl(url: InsertShortenedUrl): Promise<ShortenedUrl>;
  incrementUrlClicks(code: string): Promise<void>;
  
  // API logging methods
  logApiCall(log: InsertApiLog): Promise<ApiLog>;
  getUserApiUsage(userId: number): Promise<number>;
}

// Memory Storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jokes: Map<number, Joke>;
  private quotes: Map<number, Quote>;
  private shortenedUrls: Map<string, ShortenedUrl>;
  private apiLogs: Map<number, ApiLog>;
  
  // Current IDs for each entity
  private currentUserId: number;
  private currentJokeId: number;
  private currentQuoteId: number;
  private currentUrlId: number;
  private currentLogId: number;
  
  // Sample data for jokes
  private sampleJokes: { joke: string, category: string }[] = [
    { joke: "Why don't scientists trust atoms? Because they make up everything!", category: "science" },
    { joke: "I told my wife she was drawing her eyebrows too high. She looked surprised.", category: "pun" },
    { joke: "What do you call a fake noodle? An impasta.", category: "food" },
    { joke: "Why did the scarecrow win an award? Because he was outstanding in his field.", category: "pun" },
    { joke: "I'm reading a book about anti-gravity. It's impossible to put down!", category: "science" },
    { joke: "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them.", category: "math" },
    { joke: "Why did the bicycle fall over? Because it was two tired!", category: "pun" },
    { joke: "What's the best thing about Switzerland? I don't know, but the flag is a big plus.", category: "geography" },
    { joke: "How do you organize a space party? You planet!", category: "space" },
    { joke: "Why did the programmer quit his job? Because he didn't get arrays.", category: "programming" }
  ];
  
  // Sample data for quotes
  private sampleQuotes: { text: string, author: string }[] = [
    { text: "The night is darkest just before the dawn.", author: "Harvey Dent" },
    { text: "Stars can't shine without darkness.", author: "D.H. Sidebottom" },
    { text: "Those who dream by day are cognizant of many things which escape those who dream only by night.", author: "Edgar Allan Poe" },
    { text: "The night is a world lit by itself.", author: "Antonio Porchia" },
    { text: "Night is the other half of life, and the better half.", author: "Goethe" }
  ];

  constructor() {
    this.users = new Map();
    this.jokes = new Map();
    this.quotes = new Map();
    this.shortenedUrls = new Map();
    this.apiLogs = new Map();
    
    this.currentUserId = 1;
    this.currentJokeId = 1;
    this.currentQuoteId = 1;
    this.currentUrlId = 1;
    this.currentLogId = 1;
    
    // Initialize with sample jokes
    this.sampleJokes.forEach(joke => {
      this.createJoke({
        joke: joke.joke,
        category: joke.category
      });
    });
    
    // Initialize with sample quotes
    this.sampleQuotes.forEach(quote => {
      this.createQuote({
        text: quote.text,
        author: quote.author
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByApiKey(apiKey: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.api_key === apiKey,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const apiKey = crypto.randomBytes(16).toString('hex');
    const user: User = { 
      ...insertUser, 
      id,
      api_key: apiKey,
      rate_limit: 100,
      created_at: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  // Joke methods
  async getJoke(id: number): Promise<Joke | undefined> {
    return this.jokes.get(id);
  }
  
  async getRandomJoke(): Promise<Joke | undefined> {
    const jokes = Array.from(this.jokes.values());
    if (jokes.length === 0) return undefined;
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  
  async getJokesByCategory(category: string): Promise<Joke[]> {
    return Array.from(this.jokes.values()).filter(
      (joke) => joke.category?.toLowerCase() === category.toLowerCase(),
    );
  }
  
  async createJoke(insertJoke: InsertJoke): Promise<Joke> {
    const id = this.currentJokeId++;
    const joke: Joke = {
      ...insertJoke,
      id,
      created_at: new Date()
    };
    this.jokes.set(id, joke);
    return joke;
  }
  
  // Quote methods
  async getQuote(id: number): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }
  
  async getRandomQuote(): Promise<Quote | undefined> {
    const quotes = Array.from(this.quotes.values());
    if (quotes.length === 0) return undefined;
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
  
  async getQuotesByAuthor(author: string): Promise<Quote[]> {
    return Array.from(this.quotes.values()).filter(
      (quote) => quote.author?.toLowerCase().includes(author.toLowerCase()),
    );
  }
  
  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = this.currentQuoteId++;
    const quote: Quote = {
      ...insertQuote,
      id,
      created_at: new Date()
    };
    this.quotes.set(id, quote);
    return quote;
  }
  
  // URL shortening methods
  async getShortenedUrl(code: string): Promise<ShortenedUrl | undefined> {
    return this.shortenedUrls.get(code);
  }
  
  async createShortenedUrl(insertUrl: InsertShortenedUrl): Promise<ShortenedUrl> {
    const id = this.currentUrlId++;
    const url: ShortenedUrl = {
      ...insertUrl,
      id,
      clicks: 0,
      created_at: new Date()
    };
    this.shortenedUrls.set(url.code, url);
    return url;
  }
  
  async incrementUrlClicks(code: string): Promise<void> {
    const url = this.shortenedUrls.get(code);
    if (url) {
      url.clicks += 1;
      this.shortenedUrls.set(code, url);
    }
  }
  
  // API logging methods
  async logApiCall(insertLog: InsertApiLog): Promise<ApiLog> {
    const id = this.currentLogId++;
    const log: ApiLog = {
      ...insertLog,
      id,
      timestamp: new Date()
    };
    this.apiLogs.set(id, log);
    return log;
  }
  
  async getUserApiUsage(userId: number): Promise<number> {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Count today's API calls for this user
    return Array.from(this.apiLogs.values()).filter(
      (log) => log.user_id === userId && log.timestamp >= today
    ).length;
  }
}

export const storage = new MemStorage();
