import { Request, Response } from 'express';
import { z } from 'zod';

// Mock exchange rates data for demonstration
const currencyRates = {
  USD: 1.0,
  EUR: 0.9125,
  GBP: 0.7821,
  JPY: 139.42,
  CAD: 1.3582,
  AUD: 1.4921,
  CHF: 0.8955,
  CNY: 6.9123,
  INR: 82.456,
  BRL: 5.1842
};

// Get currency exchange rates
export async function getCurrencyRates(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      base: z.string().optional().default('USD')
    });
    
    const { base } = schema.parse(req.query);
    
    // Check if base currency is supported
    if (!currencyRates[base.toUpperCase() as keyof typeof currencyRates]) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Unsupported base currency: ${base}`
      });
    }
    
    // Calculate rates relative to the base currency
    const baseRate = currencyRates[base.toUpperCase() as keyof typeof currencyRates];
    const rates: Record<string, number> = {};
    
    for (const [currency, rate] of Object.entries(currencyRates)) {
      rates[currency] = parseFloat((rate / baseRate).toFixed(6));
    }
    
    // Return exchange rates
    res.json({
      base,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      rates
    });
    
  } catch (error: any) {
    console.error('Error getting currency rates:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}

// Convert currencies
export async function convertCurrency(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      from: z.string().min(3).max(3),
      to: z.string().min(3).max(3),
      amount: z.string().transform(val => parseFloat(val))
    });
    
    const { from, to, amount } = schema.parse(req.query);
    
    // Check if currencies are supported
    const fromCurrency = from.toUpperCase();
    const toCurrency = to.toUpperCase();
    
    if (!currencyRates[fromCurrency as keyof typeof currencyRates]) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Unsupported source currency: ${fromCurrency}`
      });
    }
    
    if (!currencyRates[toCurrency as keyof typeof currencyRates]) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Unsupported target currency: ${toCurrency}`
      });
    }
    
    // Calculate conversion
    const fromRate = currencyRates[fromCurrency as keyof typeof currencyRates];
    const toRate = currencyRates[toCurrency as keyof typeof currencyRates];
    const rate = toRate / fromRate;
    const result = amount * rate;
    
    // Return conversion result
    res.json({
      from: fromCurrency,
      to: toCurrency,
      amount,
      result: parseFloat(result.toFixed(2)),
      rate: parseFloat(rate.toFixed(6)),
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Error converting currency:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}
