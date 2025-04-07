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

export async function downloadYoutubeVideo(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      url: z.string().url(),
      format: z.enum(['mp4', 'webm', 'mkv']).default('mp4'),
      quality: z.enum(['best', '1080p', '720p', '480p', '360p']).default('720p')
    });
    
    const { url, format, quality } = schema.parse(req.query);
    
    // Generate a unique filename
    const fileId = crypto.randomBytes(8).toString('hex');
    const outputPath = path.join(downloadDir, `${fileId}.${format}`);
    
    // Command to download video using yt-dlp
    let qualityArg = '';
    if (quality === 'best') {
      qualityArg = '-f best';
    } else {
      // Extract the resolution from quality (e.g., '720p' -> '720')
      const resolution = quality.replace('p', '');
      qualityArg = `-f "bestvideo[height<=?${resolution}]+bestaudio/best[height<=?${resolution}]"`;
    }
    
    const command = `yt-dlp ${qualityArg} -o "${outputPath}" "${url}"`;
    
    console.log(`Executing command: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing yt-dlp: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to download video',
          details: error.message
        });
      }
      
      // Check if the file exists
      if (!fs.existsSync(outputPath)) {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to save video file'
        });
      }
      
      // Set appropriate headers
      res.setHeader('Content-Type', `video/${format}`);
      res.setHeader('Content-Disposition', `attachment; filename="video.${format}"`);
      
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
    console.error('Error downloading YouTube video:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}