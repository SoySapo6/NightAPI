import { Request, Response } from 'express';
import { z } from 'zod';
import axios from 'axios';

export async function searchGoogle(req: Request, res: Response) {
  try {
    // Validar parámetros de consulta
    const schema = z.object({
      query: z.string().min(1).max(100)
    });
    
    const { query } = schema.parse(req.query);
    
    try {
      // Intentar con la primera API
      console.log("Intentando búsqueda de Google con primera API...");
      const response = await axios.get(`https://api.alyachan.dev/api/google?q=${encodeURIComponent(query)}&apikey=Gata-Dios`);
      
      if (response.data && response.data.status && response.data.data && response.data.data.length > 0) {
        // Crear formato de respuesta
        const results = response.data.data.map((result: any) => ({
          title: result.title,
          url: result.formattedUrl || result.url,
          description: result.snippet || result.description
        }));
        
        // Obtener una captura de la página de resultados
        const screenshotUrl = `https://image.thum.io/get/fullpage/https://google.com/search?q=${encodeURIComponent(query)}`;
        
        return res.json({
          success: true,
          query,
          screenshot: screenshotUrl,
          results
        });
      } else {
        throw new Error("No se encontraron resultados en la primera API");
      }
    } catch (error) {
      // Si la primera API falla, intentar con la segunda
      console.log("Primera API falló, intentando con API alternativa...");
      
      try {
        const alternativeResponse = await axios.get(`https://api-v1.majhcc.com/api/google?q=${encodeURIComponent(query)}`);
        
        if (alternativeResponse.data && alternativeResponse.data.results && alternativeResponse.data.results.length > 0) {
          // Crear formato de respuesta
          const results = alternativeResponse.data.results.map((result: any) => ({
            title: result.title,
            url: result.link,
            description: result.description
          }));
          
          // Obtener una captura de la página de resultados
          const screenshotUrl = `https://image.thum.io/get/fullpage/https://google.com/search?q=${encodeURIComponent(query)}`;
          
          return res.json({
            success: true,
            query,
            screenshot: screenshotUrl,
            results
          });
        } else {
          throw new Error("No se encontraron resultados");
        }
      } catch (secondError) {
        // Probar con una tercera API si las dos primeras fallan
        try {
          const thirdApiResponse = await axios.get(`https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${process.env.SERPAPI_KEY || ""}`);
          
          if (thirdApiResponse.data && thirdApiResponse.data.organic_results && thirdApiResponse.data.organic_results.length > 0) {
            // Crear formato de respuesta
            const results = thirdApiResponse.data.organic_results.map((result: any) => ({
              title: result.title,
              url: result.link,
              description: result.snippet
            }));
            
            return res.json({
              success: true,
              query,
              screenshot: thirdApiResponse.data.search_metadata?.google_url || `https://google.com/search?q=${encodeURIComponent(query)}`,
              results
            });
          } else {
            throw new Error("No se encontraron resultados en ninguna API");
          }
        } catch (thirdError) {
          console.error("Error en todas las APIs de búsqueda:", thirdError);
          return res.status(500).json({
            error: "Internal Server Error",
            message: "No se pudo completar la búsqueda en Google. Si tienes una API key de SerpAPI, puedes configurarla como SERPAPI_KEY en las variables de entorno."
          });
        }
      }
    }
  } catch (error: any) {
    console.error("Error en endpoint de búsqueda de Google:", error);
    res.status(400).json({
      error: "Bad Request",
      message: error.message
    });
  }
}