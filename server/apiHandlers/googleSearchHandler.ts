import { Request, Response } from 'express';
import { z } from 'zod';
import axios from 'axios';

// Tipo para resultados
type SearchResult = {
  title: string;
  url: string;
  description: string;
};

// Resultados de demostración para evitar dependencias de APIs externas
const demoResults: Record<string, SearchResult[]> = {
  "night sky photography": [
    {
      title: "Astrofotografía: Guía para fotografiar el cielo nocturno",
      url: "https://www.photopills.com/es/articulos/guia-fotografia-cielo-nocturno",
      description: "Descubre cómo capturar impresionantes fotografías del cielo nocturno con consejos de expertos, configuraciones de cámara y técnicas de postprocesado."
    },
    {
      title: "Las mejores cámaras para fotografía nocturna 2023",
      url: "https://www.digitalcameraworld.com/best-cameras-for-astrophotography",
      description: "Comparativa de las cámaras más adecuadas para astrofotografía, desde opciones para principiantes hasta modelos profesionales."
    },
    {
      title: "Cómo fotografiar la Vía Láctea: guía completa",
      url: "https://petapixel.com/how-to-photograph-the-milky-way",
      description: "Tutorial paso a paso para capturar espectaculares imágenes de la Vía Láctea, incluyendo planificación, equipo necesario y técnicas de composición."
    }
  ],
  "programación javascript": [
    {
      title: "MDN Web Docs: JavaScript",
      url: "https://developer.mozilla.org/es/docs/Web/JavaScript",
      description: "Documentación completa sobre el lenguaje JavaScript, con tutoriales, referencias y ejemplos prácticos."
    },
    {
      title: "JavaScript.info - El lenguaje JavaScript moderno",
      url: "https://es.javascript.info/",
      description: "Tutorial desde principiante hasta avanzado sobre JavaScript moderno, con explicaciones detalladas y ejercicios prácticos."
    },
    {
      title: "FreeCodeCamp: Curso de JavaScript",
      url: "https://www.freecodecamp.org/espanol/learn/javascript-algorithms-and-data-structures/",
      description: "Curso gratuito y certificado de JavaScript que cubre algoritmos, estructuras de datos y programación funcional."
    }
  ],
  "recetas de cocina": [
    {
      title: "Recetas fáciles para principiantes",
      url: "https://www.recetasgratis.net/recetas-faciles-1.html",
      description: "Colección de recetas sencillas ideales para quienes se inician en la cocina, con paso a paso detallados."
    },
    {
      title: "Recetas internacionales - Directo al Paladar",
      url: "https://www.directoalpaladar.com/categoria/cocina-internacional",
      description: "Las mejores recetas de la gastronomía mundial adaptadas para cocinar en casa."
    },
    {
      title: "Recetas saludables para toda la semana",
      url: "https://www.deliciousmagazine.co.uk/collections/healthy-recipes/",
      description: "Planifica tus comidas semanales con estas opciones nutritivas y llenas de sabor, perfectas para un estilo de vida saludable."
    }
  ]
};

// Palabras clave de respaldo
const fallbackKeywords = ["night sky photography", "programación javascript", "recetas de cocina"];

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
        // Si tenemos una API key de SerpAPI, intentamos usarla
        if (process.env.SERPAPI_KEY) {
          try {
            const thirdApiResponse = await axios.get(`https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${process.env.SERPAPI_KEY}`);
            
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
            }
          } catch (thirdError) {
            console.error("Error en SerpAPI:", thirdError);
          }
        }
        
        // Si todas las APIs fallan o no hay API key, usar resultados de demostración
        console.log("Todas las APIs fallaron, usando resultados de demostración");
        
        // Encontrar la palabra clave más similar o usar una por defecto
        let bestMatch = fallbackKeywords[0];
        
        for (const keyword of fallbackKeywords) {
          if (query.toLowerCase().includes(keyword.toLowerCase()) || 
              keyword.toLowerCase().includes(query.toLowerCase())) {
            bestMatch = keyword;
            break;
          }
        }
        
        let results = demoResults[fallbackKeywords[0]];
        // Buscar la mejor coincidencia
        for (const key in demoResults) {
          if (key === bestMatch || key.includes(query) || query.includes(key)) {
            results = demoResults[key];
            break;
          }
        }
        const screenshotUrl = `https://image.thum.io/get/fullpage/https://google.com/search?q=${encodeURIComponent(query)}`;
        
        return res.json({
          success: true,
          query,
          note: "Usando resultados de demostración. Para resultados reales, configura SERPAPI_KEY.",
          screenshot: screenshotUrl,
          results
        });
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