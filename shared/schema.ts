import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  api_key: text("api_key").notNull().unique(),
  rate_limit: integer("rate_limit").notNull().default(100), // requests per day
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Jokes
export const jokes = pgTable("jokes", {
  id: serial("id").primaryKey(),
  joke: text("joke").notNull(),
  category: text("category"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertJokeSchema = createInsertSchema(jokes).pick({
  joke: true,
  category: true,
});

// Quotes
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  author: text("author"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuoteSchema = createInsertSchema(quotes).pick({
  text: true,
  author: true,
});

// Shortened URLs
export const shortenedUrls = pgTable("shortened_urls", {
  id: serial("id").primaryKey(),
  original_url: text("original_url").notNull(),
  code: text("code").notNull().unique(),
  clicks: integer("clicks").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertShortenedUrlSchema = createInsertSchema(shortenedUrls).pick({
  original_url: true,
  code: true,
});

// API Usage Logs
export const apiLogs = pgTable("api_logs", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id),
  endpoint: text("endpoint").notNull(),
  status_code: integer("status_code").notNull(),
  response_time: integer("response_time").notNull(), // in milliseconds
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertApiLogSchema = createInsertSchema(apiLogs).pick({
  user_id: true,
  endpoint: true,
  status_code: true,
  response_time: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Joke = typeof jokes.$inferSelect;
export type InsertJoke = z.infer<typeof insertJokeSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type ShortenedUrl = typeof shortenedUrls.$inferSelect;
export type InsertShortenedUrl = z.infer<typeof insertShortenedUrlSchema>;

export type ApiLog = typeof apiLogs.$inferSelect;
export type InsertApiLog = z.infer<typeof insertApiLogSchema>;
