import { Request, Response } from 'express';
import { z } from 'zod';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Create a directory for music downloads if it doesn't exist
const musicDir = path.join(process.cwd(), 'music');
if (!fs.existsSync(musicDir)) {
  fs.mkdirSync(musicDir, { recursive: true });
}

export async function searchSoundcloud(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      query: z.string().min(1).max(200)
    });
    
    const { query } = schema.parse(req.query);
    
    try {
      // Search for the song using the API
      const searchUrl = `https://apis-starlights-team.koyeb.app/starlight/soundcloud-search?text=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl);
      const searchResults = response.data;
      
      if (!searchResults || !searchResults.length || !searchResults[0]?.url) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'No results found on SoundCloud'
        });
      }
      
      // Return search results
      res.json({
        success: true,
        query,
        results: searchResults.slice(0, 5).map((result: any) => ({
          title: result.title,
          url: result.url,
          thumbnail: result.thumbnail,
          artist: result.artist
        }))
      });
      
    } catch (error: any) {
      console.error('Error searching SoundCloud:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to search SoundCloud',
        details: error.message
      });
    }
    
  } catch (error: any) {
    console.error('Error in SoundCloud search endpoint:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}

export async function downloadSoundcloud(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      url: z.string().url()
    });
    
    const { url } = schema.parse(req.query);
    
    try {
      // Get download info from API
      const downloadUrl = `https://apis-starlights-team.koyeb.app/starlight/soundcloud?url=${url}`;
      const response = await axios.get(downloadUrl);
      const { link: dl_url, quality, image, title } = response.data;
      
      if (!dl_url) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Could not get download link for this track'
        });
      }
      
      // Generate unique filename
      const fileId = crypto.randomBytes(8).toString('hex');
      const outputPath = path.join(musicDir, `${fileId}.mp3`);
      
      // Download audio file
      const audioResponse = await axios.get(dl_url, { responseType: 'arraybuffer' });
      fs.writeFileSync(outputPath, audioResponse.data);
      
      // Set appropriate headers
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(title)}.mp3"`);
      
      // Stream the file
      const fileStream = fs.createReadStream(outputPath);
      fileStream.pipe(res);
      
      // Clean up the file after sending
      fileStream.on('end', () => {
        fs.unlink(outputPath, (err) => {
          if (err) console.error(`Error deleting audio file: ${err.message}`);
        });
      });
      
    } catch (error: any) {
      console.error('Error downloading from SoundCloud:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to download from SoundCloud',
        details: error.message
      });
    }
    
  } catch (error: any) {
    console.error('Error in SoundCloud download endpoint:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}