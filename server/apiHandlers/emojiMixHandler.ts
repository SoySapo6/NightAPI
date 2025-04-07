import { Request, Response } from 'express';
import { z } from 'zod';
import axios from 'axios';

// Función para convertir emoji a código Unicode
function getEmojiUnicode(emoji: string): string {
  let unicode = '';
  for (let i = 0; i < emoji.length; i++) {
    unicode += emoji.charCodeAt(i).toString(16);
  }
  return unicode;
}

export async function mixEmojis(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      emoji1: z.string().min(1).max(10),
      emoji2: z.string().min(1).max(10)
    });
    
    const { emoji1, emoji2 } = schema.parse(req.query);
    
    try {
      // Obtener el código Unicode de los emojis
      const emoji1Code = getEmojiUnicode(emoji1);
      const emoji2Code = getEmojiUnicode(emoji2);
      
      // Probar con diferentes versiones de EmojiKitchen
      const versions = [
        "20201001", "20210218", "20210521", "20210831", 
        "20211115", "20220203", "20220506", "20220815", 
        "20221101", "20230301", "20230803"
      ];
      
      // Probar todas las combinaciones posibles
      for (const version of versions) {
        // Primero intentar con el orden original
        const apiUrl = `https://www.gstatic.com/android/keyboard/emojikitchen/${version}/${emoji1Code}/${emoji1Code}_${emoji2Code}.png`;
        
        try {
          // Verificar si existe la imagen combinada
          const response = await axios.head(apiUrl);
          
          if (response.status === 200) {
            // La imagen existe
            return res.json({
              success: true,
              emoji1,
              emoji2,
              results: [{
                url: apiUrl,
                content_description: `Mix of ${emoji1} and ${emoji2}`
              }]
            });
          }
        } catch (error) {
          // Intentar con el orden invertido
          const reversedApiUrl = `https://www.gstatic.com/android/keyboard/emojikitchen/${version}/${emoji2Code}/${emoji2Code}_${emoji1Code}.png`;
          
          try {
            const reversedResponse = await axios.head(reversedApiUrl);
            
            if (reversedResponse.status === 200) {
              // La imagen existe con el orden invertido
              return res.json({
                success: true,
                emoji1,
                emoji2,
                results: [{
                  url: reversedApiUrl,
                  content_description: `Mix of ${emoji2} and ${emoji1}`
                }]
              });
            }
          } catch (error) {
            // Continuar con la siguiente versión
            continue;
          }
        }
      }
      
      // Si llega aquí, no se encontró ninguna combinación
      return res.status(404).json({
        error: 'Not Found',
        message: 'No se encontró una combinación para esos emojis'
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