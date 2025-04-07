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
      // Variables para almacenar la información de descarga
      let dl_url = null;
      let title = 'soundcloud-track';
      let image = '';
      let quality = 'mp3';
      
      try {
        // Primer intento: API primaria
        console.log("Intentando con API primaria...");
        const downloadUrl = `https://socder.net/download?url=${url}`;
        
        // Obtener la página que contiene los enlaces
        const response = await axios.get(downloadUrl);
        
        // Extraer la información de la canción del HTML usando regex
        const titleMatch = response.data.match(/<h1[^>]*>([^<]+)<\/h1>/);
        if (titleMatch) title = titleMatch[1].trim();
        
        const imageMatch = response.data.match(/<meta property="og:image" content="([^"]+)"/);
        if (imageMatch) image = imageMatch[1];
        
        // Buscar los enlaces de descarga en el HTML
        const downloadLinkMatch = response.data.match(/href="(https:\/\/cf-media\.sndcdn\.com[^"]+)"/);
        if (downloadLinkMatch) dl_url = downloadLinkMatch[1];
        
        console.log("API primaria resultados:", { title, dl_url: dl_url ? "encontrado" : "no encontrado" });
      } catch (error) {
        const err = error as Error;
        console.log("Error en API primaria:", err.message || "Error desconocido");
      }
      
      // Si la primera API falló, intentar con la segunda
      if (!dl_url) {
        try {
          console.log("Intentando con API secundaria...");
          // API alternativa como respaldo
          const backupUrl = `https://soundcloud-downloader-five.vercel.app/api?url=${url}`;
          const backupResponse = await axios.get(backupUrl);
          
          if (backupResponse.data && backupResponse.data.link) {
            dl_url = backupResponse.data.link;
            if (backupResponse.data.title) title = backupResponse.data.title;
            if (backupResponse.data.thumbnail) image = backupResponse.data.thumbnail;
            console.log("API secundaria exitosa");
          } else {
            console.log("API secundaria no proporcionó un enlace");
          }
        } catch (error) {
          const err = error as Error;
          console.log("Error en API secundaria:", err.message || "Error desconocido");
        }
      }
      
      // Si ambas APIs fallaron, intentar con la tercera
      if (!dl_url) {
        try {
          console.log("Intentando con API terciaria...");
          const thirdUrl = `https://api.soundcloudmp3.org/converter?url=${url}`;
          const thirdResponse = await axios.get(thirdUrl);
          
          const linkMatch = thirdResponse.data.match(/href="(https:\/\/[^"]+\.mp3[^"]*?)"/);
          if (linkMatch) {
            dl_url = linkMatch[1];
            console.log("API terciaria exitosa");
          } else {
            console.log("API terciaria no proporcionó un enlace");
          }
        } catch (error) {
          const err = error as Error;
          console.log("Error en API terciaria:", err.message || "Error desconocido");
        }
      }
      
      // Si todas las APIs fallaron, devolver error
      if (!dl_url) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Could not get download link for this track'
        });
      }
      
      console.log("Enlace de descarga obtenido:", { url: dl_url.substring(0, 50) + "..." });
      
      // Generate unique filename
      const fileId = crypto.randomBytes(8).toString('hex');
      const outputPath = path.join(musicDir, `${fileId}.mp3`);
      
      // Download audio file
      const audioResponse = await axios.get(dl_url, { 
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
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