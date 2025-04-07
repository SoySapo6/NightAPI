import { Request, Response } from 'express';
import { z } from 'zod';
import axios from 'axios';

// API Key for Tenor (esta debe ser guardada como variable de entorno en producción)
const TENOR_API_KEY = "AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ";

export async function mixEmojis(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      emoji1: z.string().min(1).max(4),
      emoji2: z.string().min(1).max(4)
    });
    
    const { emoji1, emoji2 } = schema.parse(req.query);
    
    try {
      // Construir la URL de la API de Emoji Kitchen
      const apiUrl = `https://tenor.googleapis.com/v2/featured?key=${TENOR_API_KEY}&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;
      
      // Hacer la solicitud a la API
      const response = await axios.get(apiUrl);
      
      // Verificar si hay resultados
      if (!response.data.results || response.data.results.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'No se encontró una combinación para esos emojis'
        });
      }
      
      // Extraer las URLs de las imágenes
      const results = response.data.results.map((result: any) => ({
        url: result.url,
        content_description: result.content_description || 'Emoji Mix'
      }));
      
      res.json({
        success: true,
        emoji1,
        emoji2,
        results
      });
      
    } catch (error: any) {
      console.error('Error al combinar emojis:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Error al combinar emojis',
        details: error.message
      });
    }
    
  } catch (error: any) {
    console.error('Error en el endpoint de EmojiMix:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}