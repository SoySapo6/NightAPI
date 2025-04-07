import { Request, Response } from 'express';
import { z } from 'zod';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Directorio para guardar imágenes temporalmente
const outputDir = path.join(process.cwd(), 'dalle');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

export async function generateImage(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      prompt: z.string().min(1).max(1000)
    });
    
    const { prompt } = schema.parse(req.query);
    
    try {
      // URL de la API para generar imágenes de texto a imagen
      const apiUrl = `https://eliasar-yt-api.vercel.app/api/ai/text2img?prompt=${encodeURIComponent(prompt)}`;
      
      // Generar un nombre de archivo único
      const fileName = `imagen_${crypto.randomBytes(8).toString('hex')}.jpg`;
      const filePath = path.join(outputDir, fileName);
      
      // Descargar la imagen
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(filePath, response.data);
      
      // Verificar si la imagen se descargó correctamente
      if (!fs.existsSync(filePath)) {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'No se pudo guardar la imagen generada'
        });
      }
      
      // Configurar encabezados para la respuesta
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Disposition', `attachment; filename="dalle_${Date.now()}.jpg"`);
      
      // Transmitir la imagen como respuesta
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
      // Eliminar la imagen después de enviarla
      fileStream.on('end', () => {
        fs.unlink(filePath, (err) => {
          if (err) console.error(`Error al eliminar la imagen: ${err.message}`);
        });
      });
      
    } catch (error: any) {
      console.error('Error al generar la imagen:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Error al generar la imagen',
        details: error.message
      });
    }
    
  } catch (error: any) {
    console.error('Error en el endpoint de DALL-E:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}