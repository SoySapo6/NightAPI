import { Request, Response } from 'express';
import { z } from 'zod';
import axios from 'axios';

// La API key y username se deberían guardar en variables de entorno en producción
const API_KEY = "your_api_key_here"; // Reemplazar con tu API key real
const USERNAME = "nightapi";

export async function getSimiResponse(req: Request, res: Response) {
  try {
    // Validate query parameters
    const schema = z.object({
      text: z.string().min(1).max(500),
      language: z.string().default('es')
    });
    
    const { text, language } = schema.parse(req.query);
    
    try {
      // Crear la URL para la API de Simsimi
      const apiUrl = `https://darkstarsz-api.onrender.com/api/outros/simih?language=${language}&text=${encodeURIComponent(text)}&apikey=${API_KEY}&username=${USERNAME}`;
      
      // Hacer la solicitud a la API
      const response = await axios.get(apiUrl);
      
      // Verificar si la respuesta contiene el resultado
      if (response.data && response.data.resultado) {
        res.json({
          success: true,
          text,
          language,
          response: response.data.resultado
        });
      } else {
        res.status(500).json({
          error: 'API Error',
          message: 'No se pudo obtener una respuesta de SimSimi'
        });
      }
    } catch (error: any) {
      console.error('Error al llamar a la API de SimSimi:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Error al comunicarse con la API de SimSimi',
        details: error.message
      });
    }
    
  } catch (error: any) {
    console.error('Error en el endpoint de SimSimi:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
}