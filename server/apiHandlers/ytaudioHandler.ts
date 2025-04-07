import { Request, Response } from 'express';
import { z } from 'zod';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Create a directory for downloads if it doesn't exist
const downloadDir = path.join(process.cwd(), 'downloads');
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

export async function downloadYoutubeAudio(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      url: z.string().url(),
      format: z.enum(['mp3', 'aac', 'm4a']).default('mp3')
    });
    
    const { url, format } = schema.parse(req.query);
    
    // Generate a unique filename
    const fileId = crypto.randomBytes(8).toString('hex');
    const outputPath = path.join(downloadDir, `${fileId}.${format}`);
    
    // Command to download audio using yt-dlp
    const command = `yt-dlp -x --audio-format ${format} --audio-quality 0 -o "${outputPath}" "${url}"`;
    
    console.log(`Executing command: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing yt-dlp: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to download audio',
          details: error.message
        });
      }
      
      // Check if the file exists
      if (!fs.existsSync(outputPath)) {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to save audio file'
        });
      }
      
      // Set appropriate headers
      res.setHeader('Content-Type', `audio/${format}`);
      res.setHeader('Content-Disposition', `attachment; filename="audio.${format}"`);
      
      // Stream the file
      const fileStream = fs.createReadStream(outputPath);
      fileStream.pipe(res);
      
      // Clean up the file after sending
      fileStream.on('end', () => {
        fs.unlink(outputPath, (err) => {
          if (err) console.error(`Error deleting file: ${err.message}`);
        });
      });
    });
  } catch (error: any) {
    console.error('Error downloading YouTube audio:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}