import { Request, Response } from 'express';
import { z } from 'zod';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as util from 'util';

const execPromise = util.promisify(exec);

// Create downloads directory if it doesn't exist
const downloadDir = path.join(process.cwd(), 'downloads', 'video');
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

export async function downloadYoutubeVideo(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      url: z.string().url().includes('youtube.com', { message: 'Only YouTube URLs are supported' }).or(
          z.string().url().includes('youtu.be', { message: 'Only YouTube URLs are supported' })
      ),
      format: z.enum(['mp4', 'webm']).default('mp4'),
      quality: z.enum(['360p', '480p', '720p', '1080p']).default('720p')
    });
    
    const { url, format, quality } = schema.parse(req.query);
    
    // Generate unique filename to avoid collisions
    const fileId = crypto.randomBytes(8).toString('hex');
    const outputPath = path.join(downloadDir, `${fileId}.${format}`);
    
    try {
      // First, get video info
      const { stdout: infoOutput } = await execPromise(
        `yt-dlp --dump-json "${url}"`
      );
      
      const videoInfo = JSON.parse(infoOutput);
      const { title, uploader, duration } = videoInfo;
      
      // Primero obtenemos los formatos disponibles
      const { stdout: formatsOutput } = await execPromise(
        `yt-dlp -F "${url}"`
      );
      
      console.log("Formatos disponibles:", formatsOutput);
      
      // Seleccionar el mejor formato según la calidad solicitada
      let formatString = '';
      
      // Calidad deseada en orden de preferencia
      if (quality === '1080p') {
        formatString = 'bestvideo[height<=1080]+bestaudio/best[height<=1080]/best';
      } else if (quality === '720p') {
        formatString = 'bestvideo[height<=720]+bestaudio/best[height<=720]/best';
      } else if (quality === '480p') {
        formatString = 'bestvideo[height<=480]+bestaudio/best[height<=480]/best';
      } else {
        formatString = 'bestvideo[height<=360]+bestaudio/best[height<=360]/best';
      }
      
      // Download video con más opciones para evitar throttling
      const command = `yt-dlp -f ${formatString} --no-check-certificates --geo-bypass -o "${outputPath}" "${url}"`;
      console.log("Ejecutando comando:", command);
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
      res.setHeader('Content-Type', `video/${format}`);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(title)}.${format}"`);
      
      // Stream the file
      const fileStream = fs.createReadStream(outputPath);
      fileStream.pipe(res);
      
      // Delete file after sending
      fileStream.on('end', () => {
        fs.unlink(outputPath, (err) => {
          if (err) console.error(`Error deleting video file: ${err.message}`);
        });
      });
      
      // Log success (but don't send in response as we're streaming the file)
      console.log({
        success: true,
        format,
        quality,
        title,
        author: uploader,
        duration: durationFormatted,
        file_size: `${fileSizeInMB} MB`
      });
      
    } catch (error: any) {
      console.error('Error downloading YouTube video:', error);
      
      // Clean up any partial downloads
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to download YouTube video',
        details: error.message
      });
    }
    
  } catch (error: any) {
    console.error('Error in YouTube video endpoint:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}