import { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import crypto from 'crypto';

// Mock JWT generation function
function generateJwt(userId: number): string {
  // In a real application, use a proper JWT library
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ 
    sub: userId.toString(),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
  })).toString('base64');
  
  const signature = crypto
    .createHmac('sha256', 'nightapi-secret-key')
    .update(`${header}.${payload}`)
    .digest('base64');
  
  return `${header}.${payload}.${signature}`;
}

// Register new user
export async function register(req: Request, res: Response) {
  try {
    // Validate request body
    const schema = z.object({
      username: z.string().min(3).max(50),
      password: z.string().min(8).max(100)
    });
    
    const { username, password } = schema.parse(req.body);
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Username already exists'
      });
    }
    
    // Hash password (in a real app, use bcrypt)
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
    
    // Create user
    const user = await storage.createUser({
      username,
      password: hashedPassword
    });
    
    // Generate token
    const token = generateJwt(user.id);
    
    // Return user data and token
    res.status(201).json({
      success: true,
      user_id: user.id.toString(),
      username: user.username,
      api_key: user.api_key,
      token,
      expires_in: 3600
    });
    
  } catch (error: any) {
    console.error('Error registering user:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}

// Login user
export async function login(req: Request, res: Response) {
  try {
    // Validate request body
    const schema = z.object({
      username: z.string(),
      password: z.string()
    });
    
    const { username, password } = schema.parse(req.body);
    
    // Find user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid username or password'
      });
    }
    
    // Hash password and compare
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
    
    if (user.password !== hashedPassword) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid username or password'
      });
    }
    
    // Generate token
    const token = generateJwt(user.id);
    
    // Return user data and token
    res.json({
      success: true,
      user_id: user.id.toString(),
      username: user.username,
      api_key: user.api_key,
      token,
      expires_in: 3600
    });
    
  } catch (error: any) {
    console.error('Error logging in:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}

// Validate token
export async function validateToken(req: Request, res: Response) {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // In a real app, validate and decode JWT
    // This is a simplified mock implementation
    const parts = token.split('.');
    if (parts.length !== 3) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token format'
      });
    }
    
    try {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      
      // Check token expiry
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Token expired'
        });
      }
      
      // Find user
      const userId = parseInt(payload.sub);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not found'
        });
      }
      
      // Return token validation status
      res.json({
        valid: true,
        user_id: user.id.toString(),
        username: user.username,
        expires_at: new Date(payload.exp * 1000).toISOString()
      });
      
    } catch (e) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }
    
  } catch (error: any) {
    console.error('Error validating token:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}
