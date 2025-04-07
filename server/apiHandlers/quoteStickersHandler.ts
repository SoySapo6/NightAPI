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

export async function generateQuoteSticker(req: Request, res: Response) {
  try {
    // Validar parámetros de consulta
    const schema = z.object({
      text: z.string().min(1).max(65),
      name: z.string().min(1).optional(),
      avatar: z.string().url().optional()
    });
    
    const { text, name, avatar } = schema.parse(req.query);
    
    try {
      // Configurar opciones para la API de generación de citas
      const defaultAvatar = 'https://telegra.ph/file/24fa902ead26340f3df2c.png';
      const userName = name || 'Usuario';
      const userAvatar = avatar || defaultAvatar;
      
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
      
      console.log("Generando sticker de cita...");
      
      // Hacer solicitud a la API para generar la imagen
      const json = await axios.post(
        'https://bot.lyo.su/quote/generate',
        quoteObj,
        {
          headers: {'Content-Type': 'application/json'},
          timeout: 25000
        }
      );
      
      if (!json.data || !json.data.result || !json.data.result.image) {
        throw new Error("La API no devolvió una imagen válida");
      }
      
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
      
    } catch (error: any) {
      console.error('Error generando sticker de cita:', error);
      
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'No se pudo generar el sticker de cita',
        details: error.message
      });
    }
    
  } catch (error: any) {
    console.error('Error en el endpoint de stickers de cita:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}