import axios from 'axios';
import { Request, Response } from 'express';

// Get API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCYWNbM2ZgdDSp9NlFxTgp0Wtwaaw7dyRc";

// Common function to handle Gemini API requests
async function getGeminiResponse(userMessage: string) {
  try {
    // Simple prompt for demonstration
    const prompt = `You are a helpful assistant provided via the NightAPI service.
    
Here is the user's message: ${userMessage}`;
    
    // Make request to Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extract the text response from Gemini
    if (response.data && 
        response.data.candidates && 
        response.data.candidates[0] && 
        response.data.candidates[0].content && 
        response.data.candidates[0].content.parts && 
        response.data.candidates[0].content.parts[0] && 
        response.data.candidates[0].content.parts[0].text) {
      
      return response.data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Failed to get proper response structure from Gemini");
    }
  } catch (error: any) {
    console.error('Error calling Gemini API:', error.message);
    if (error.response) {
      console.error('Gemini API error response:', JSON.stringify(error.response.data).substring(0, 500));
    }
    throw error;
  }
}

// Handle message parameters from various sources
function getMessageFromRequest(req: Request) {
  // For route params
  if (req.params && req.params.message) {
    return req.params.message;
  }
  
  // For query params (support both 'message' and 'mensaje')
  if (req.query) {
    if (req.query.message) {
      return req.query.message as string;
    }
    if (req.query.mensaje) {
      return req.query.mensaje as string;
    }
  }
  
  // For body params
  if (req.body && req.body.message) {
    return req.body.message;
  }
  
  return null;
}

// Main handler for Gemini requests
export async function handleGeminiRequest(req: Request, res: Response) {
  try {
    const userMessage = getMessageFromRequest(req);
    
    if (!userMessage) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Message parameter is required'
      });
    }
    
    console.log(`Processing Gemini request for message: ${userMessage}`);
    
    const geminiText = await getGeminiResponse(userMessage);
    
    // Return JSON response
    res.json({
      success: true,
      message: geminiText,
      model: "gemini-2.0-flash"
    });
  } catch (error: any) {
    console.error('Error handling Gemini request:', error.message);
    res.status(500).json({
      error: 'Internal Server Error',
      message: `Failed to process request: ${error.message}`
    });
  }
}
