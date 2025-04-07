import { Request, Response } from 'express';
import { z } from 'zod';

// Mock translation data for demonstration
const translations: Record<string, Record<string, string>> = {
  'en': {
    'Hello world': 'Hello world',
    'Good morning': 'Good morning',
    'How are you?': 'How are you?',
    'Thank you': 'Thank you',
    'Goodbye': 'Goodbye'
  },
  'es': {
    'Hello world': 'Hola mundo',
    'Good morning': 'Buenos días',
    'How are you?': '¿Cómo estás?',
    'Thank you': 'Gracias',
    'Goodbye': 'Adiós'
  },
  'fr': {
    'Hello world': 'Bonjour le monde',
    'Good morning': 'Bonjour',
    'How are you?': 'Comment ça va?',
    'Thank you': 'Merci',
    'Goodbye': 'Au revoir'
  },
  'de': {
    'Hello world': 'Hallo Welt',
    'Good morning': 'Guten Morgen',
    'How are you?': 'Wie geht es dir?',
    'Thank you': 'Danke',
    'Goodbye': 'Auf Wiedersehen'
  },
  'it': {
    'Hello world': 'Ciao mondo',
    'Good morning': 'Buongiorno',
    'How are you?': 'Come stai?',
    'Thank you': 'Grazie',
    'Goodbye': 'Arrivederci'
  }
};

// List of supported languages
const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' }
];

// Basic detection of language
function detectLanguage(text: string): string {
  // Simple language detection based on common words
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('hola') || lowerText.includes('gracias') || lowerText.includes('buenos días')) {
    return 'es';
  }
  
  if (lowerText.includes('bonjour') || lowerText.includes('merci') || lowerText.includes('au revoir')) {
    return 'fr';
  }
  
  if (lowerText.includes('hallo') || lowerText.includes('danke') || lowerText.includes('guten')) {
    return 'de';
  }
  
  if (lowerText.includes('ciao') || lowerText.includes('grazie') || lowerText.includes('buongiorno')) {
    return 'it';
  }
  
  // Default to English
  return 'en';
}

// Translate text
export async function translateText(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      text: z.string().min(1).max(1000),
      from: z.string().min(2).max(2).optional(),
      to: z.string().min(2).max(2)
    });
    
    const { text, from, to } = schema.parse(req.query);
    
    // Check if target language is supported
    if (!supportedLanguages.some(lang => lang.code === to)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Unsupported target language: ${to}`
      });
    }
    
    // Detect source language if not provided
    const detectedLang = from || detectLanguage(text);
    
    // Handle translation
    let translatedText = text;
    
    // Check if we have this exact phrase in our mock data
    if (translations[to] && translations[to][text]) {
      translatedText = translations[to][text];
    } else {
      // Fallback to add a prefix to show it was translated
      translatedText = `[${to}] ${text}`;
    }
    
    // Return translation
    res.json({
      original_text: text,
      translated_text: translatedText,
      from: detectedLang,
      to,
      detected_language: from ? undefined : detectedLang
    });
    
  } catch (error: any) {
    console.error('Error translating text:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}

// Get supported languages
export async function getSupportedLanguages(req: Request, res: Response) {
  try {
    res.json({
      count: supportedLanguages.length,
      languages: supportedLanguages
    });
    
  } catch (error: any) {
    console.error('Error getting supported languages:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}
