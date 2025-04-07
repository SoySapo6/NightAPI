import { Request, Response } from 'express';
import { z } from 'zod';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as util from 'util';

const execPromise = util.promisify(exec);

// Create downloads directory if it doesn't exist
const downloadDir = path.join(process.cwd(), 'downloads', 'audio');
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

export async function downloadYoutubeAudio(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      url: z.string().url().includes('youtube.com', { message: 'Only YouTube URLs are supported' }).or(
          z.string().url().includes('youtu.be', { message: 'Only YouTube URLs are supported' })
      ),
      format: z.enum(['mp3', 'aac', 'm4a']).default('mp3')
    });
    
    const { url, format } = schema.parse(req.query);
    
    // Generate unique filename to avoid collisions
    const fileId = crypto.randomBytes(8).toString('hex');
    const outputPath = path.join(downloadDir, `${fileId}.${format}`);
    
    try {
      // First, get video info
      const { stdout: infoOutput } = await execPromise(
        `youtube-dl --dump-json "${url}"`
      );
      
      const videoInfo = JSON.parse(infoOutput);
      const { title, uploader, duration } = videoInfo;
      
      // Download audio
      const command = `youtube-dl --extract-audio --audio-format ${format} --audio-quality 0 -o "${outputPath}" "${url}"`;
      await execPromise(command);
      
      // Check if file exists
      if (!fs.existsSync(outputPath)) {
        throw new Error('Download failed: output file not found');
      }
      
      // Get file stats
      const stats = fs.statSync(outputPath);
      const fileSizeInBytes = stats.size;
      const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
      
      // Format duration
      const durationMin = Math.floor(duration / 60);
      const durationSec = Math.floor(duration % 60);
      const durationFormatted = `${durationMin}:${durationSec.toString().padStart(2, '0')}`;
      
      // Set response headers
      res.setHeader('Content-Type', `audio/${format}`);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(title)}.${format}"`);
      
      // Stream the file
      const fileStream = fs.createReadStream(outputPath);
      fileStream.pipe(res);
      
      // Delete file after sending
      fileStream.on('end', () => {
        fs.unlink(outputPath, (err) => {
          if (err) console.error(`Error deleting audio file: ${err.message}`);
        });
      });
      
      // Log success (but don't send in response as we're streaming the file)
      console.log({
        success: true,
        format,
        title,
        author: uploader,
        duration: durationFormatted,
        file_size: `${fileSizeInMB} MB`
      });
      
    } catch (error: any) {
      console.error('Error downloading YouTube audio:', error);
      
      // Clean up any partial downloads
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to download YouTube audio',
        details: error.message
      });
    }
    
  } catch (error: any) {
    console.error('Error in YouTube audio endpoint:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}