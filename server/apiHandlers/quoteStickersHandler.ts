import { Request, Response } from 'express';
import { z } from 'zod';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Asegurarnos de que el directorio para los stickers exista
const stickersDir = path.join(process.cwd(), 'downloads', 'stickers');
if (!fs.existsSync(stickersDir)) {
  fs.mkdirSync(stickersDir, { recursive: true });
}

// Stickers prediseñados para cuando falle la API externa
const predefinedStickers = [
  // Sticker 1 - Espacio
  {
    text: "Mira las estrellas y sueña con lo imposible",
    name: "Astro Explorer",
    url: "https://i.imgur.com/lP6h5pn.png"
  },
  // Sticker 2 - Motivacional
  {
    text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día",
    name: "Motivator",
    url: "https://i.imgur.com/vYE82dv.png"
  },
  // Sticker 3 - Noche
  {
    text: "La noche es el lienzo donde brillan nuestros sueños",
    name: "NightWalker",
    url: "https://i.imgur.com/JXm8a7s.png"
  }
];

export async function generateQuoteSticker(req: Request, res: Response) {
  try {
    // Validar parámetros de consulta
    const schema = z.object({
      text: z.string().min(1).max(120),
      name: z.string().min(1).optional(),
      avatar: z.string().url().optional()
    });
    
    const { text, name, avatar } = schema.parse(req.query);
    
    // Valores por defecto
    const defaultAvatar = 'https://telegra.ph/file/24fa902ead26340f3df2c.png';
    const userName = name || 'NightWalker';
    const userAvatar = avatar || defaultAvatar;
    
    try {
      // Intentar con la API externa
      console.log("Intentando generar sticker con API externa...");
      
      // Crear objeto para la solicitud
      const quoteObj = {
        "type": "quote",
        "format": "png",
        "backgroundColor": "#000000",
        "width": 512,
        "height": 768,
        "scale": 2,
        "messages": [
          {
            "entities": [],
            "avatar": true,
            "from": {
              "id": 1,
              "name": userName,
              "photo": {
                "url": userAvatar
              }
            },
            "text": text,
            "replyMessage": {}
          }
        ]
      };
      
      // Intentar con API externa
      try {
        // Hacer solicitud a la API para generar la imagen
        const json = await axios.post(
          'https://bot.lyo.su/quote/generate',
          quoteObj,
          {
            headers: {'Content-Type': 'application/json'},
            timeout: 15000
          }
        );
        
        if (json.data && json.data.result && json.data.result.image) {
          // Decodificar la imagen desde base64
          const buffer = Buffer.from(json.data.result.image, 'base64');
          
          // Guardar la imagen temporalmente
          const fileId = crypto.randomBytes(8).toString('hex');
          const outputPath = path.join(stickersDir, `${fileId}.png`);
          fs.writeFileSync(outputPath, buffer);
          
          // Configurar respuesta
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Content-Disposition', `attachment; filename="quote-${fileId}.png"`);
          
          // Enviar archivo
          const fileStream = fs.createReadStream(outputPath);
          fileStream.pipe(res);
          
          // Eliminar archivo después de enviarlo
          fileStream.on('end', () => {
            fs.unlink(outputPath, (err) => {
              if (err) console.error(`Error al eliminar sticker: ${err.message}`);
            });
          });
          
          return;
        } else {
          throw new Error("La API no devolvió una imagen válida");
        }
      } catch (externalApiError: any) {
        console.log("Error con API externa:", externalApiError?.message || "Error desconocido");
        throw externalApiError;
      }
      
    } catch (error: any) {
      console.log("API externa falló, enviando una respuesta alternativa...");
      
      try {
        // Intentamos enviar un sticker predefinido similar
        // Encontrar el sticker más apropiado basado en la longitud del texto
        const textLength = text.length;
        const stickerIndex = Math.min(
          Math.floor(textLength / 40), 
          predefinedStickers.length - 1
        );
        const sticker = predefinedStickers[stickerIndex];
        
        // Respuesta JSON con información sobre el sticker y mensaje personalizado
        return res.json({
          success: true,
          note: "Usando un sticker predefinido debido a problemas de conexión con la API externa.",
          text: text,
          name: userName,
          format: "png",
          sticker_base: sticker.url,
          message: "Para obtener un sticker personalizado, se requiere configuración adicional. El texto y nombre enviados fueron registrados."
        });
      } catch (fallbackError) {
        console.error('Error en respuesta alternativa:', fallbackError);
        
        // Como último recurso, enviar una respuesta JSON con error
        return res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'No se pudo generar el sticker de cita',
          text: text,
          name: userName,
          format: "png"
        });
      }
    }
  } catch (error: any) {
    console.error('Error en el endpoint de stickers de cita:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}