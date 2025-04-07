import { Request, Response } from 'express';
import { z } from 'zod';
import axios from 'axios';

// Función para convertir emoji a código Unicode en formato de EmojiKitchen
function getEmojiUnicode(emoji: string): string {
  // Utilizamos el método codePointAt para manejar correctamente emojis compuestos y con modificadores
  // que pueden ocupar más de un punto de código Unicode
  let codePoint = 0;
  
  // Los emojis modernos pueden estar compuestos de múltiples puntos de código
  // Tomamos el primero que es el base del emoji (ignoramos modificadores como tono de piel)
  for (let i = 0; i < emoji.length; i++) {
    const code = emoji.codePointAt(i);
    if (code && code > 0xffff) {
      // Si es un punto de código fuera del plano BMP (Basic Multilingual Plane)
      // tenemos que hacer un tratamiento especial
      codePoint = code;
      break;
    } else if (code) {
      // Si no tenemos un punto de código mayor, usamos este
      codePoint = code;
      break;
    }
  }
  
  // Si no se encontró un punto de código válido, usar un valor por defecto
  if (!codePoint) {
    codePoint = 0x1f600; // 😀 (sonrisa por defecto)
  }
  
  // Convertir a formato hexadecimal como lo espera EmojiKitchen
  return codePoint.toString(16);
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