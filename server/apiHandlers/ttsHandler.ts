import { Request, Response } from 'express';
import { z } from 'zod';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Create a directory for tts outputs if it doesn't exist
const ttsDir = path.join(process.cwd(), 'tts');
if (!fs.existsSync(ttsDir)) {
  fs.mkdirSync(ttsDir, { recursive: true });
}

// Generate TTS using Google Translate API
async function generateTTS(text: string, lang = 'es'): Promise<string> {
  return new Promise((resolve, reject) => {
    // Generate unique filename
    const fileId = crypto.randomBytes(8).toString('hex');
    const outputPath = path.join(ttsDir, `${fileId}.mp3`);
    
    // Create URL for Google Translate TTS
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
    
    // Command to fetch the audio
    const command = `curl -s -o "${outputPath}" "${url}"`;
    
    console.log(`Executing TTS command: ${command}`);
    
    exec(command, (error) => {
      if (error) {
        console.error(`Error generating TTS: ${error.message}`);
        return reject(error);
      }
      
      // Check if the file exists and has content
      if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
        return reject(new Error('Failed to save or generate TTS file'));
      }
      
      resolve(outputPath);
    });
  });
}

export async function textToSpeech(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      text: z.string().min(1).max(200),
      lang: z.string().min(2).max(5).default('es')
    });
    
    const { text, lang } = schema.parse(req.query);
    
    try {
      // Generate TTS
      const audioPath = await generateTTS(text, lang);
      
      // Set appropriate headers
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', `attachment; filename="tts-${lang}.mp3"`);
      
      // Stream the file
      const fileStream = fs.createReadStream(audioPath);
      fileStream.pipe(res);
      
      // Clean up the file after sending
      fileStream.on('end', () => {
        fs.unlink(audioPath, (err) => {
          if (err) console.error(`Error deleting TTS file: ${err.message}`);
        });
      });
      
    } catch (error: any) {
      console.error('TTS generation error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to generate speech',
        details: error.message
      });
    }
    
  } catch (error: any) {
    console.error('Error in Text-to-Speech endpoint:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}