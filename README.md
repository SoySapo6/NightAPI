<h1 align="center" style="color:#fff;background:#111;padding:10px;border-radius:10px;">✨ NightAPI - Tu Puente hacia la Magia Digital ✨</h1>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-purple?style=flat-square" />
  <img src="https://img.shields.io/badge/status-estable-green?style=flat-square" />
  <img src="https://img.shields.io/badge/creador-SoyMaycol-blueviolet?style=flat-square" />
</p>

> Una API minimalista, poderosa y divertida para integraciones creativas en bots, apps y proyectos personales.

---

## 🌌 ¿Qué es NightAPI?

NightAPI es una colección de endpoints súper útiles para crear experiencias interactivas en bots de WhatsApp, asistentes IA, páginas web o cualquier app que necesite una dosis de magia digital nocturna.

---

## ⚙️ Instalación en Node.js

```bash
npm install nightapi-js
```

---

🧠 Uso en Node.js (Ejemplo real)
```
const NightAPI = require("nightapi-js");

(async () => {
  const respuesta = await NightAPI.gemini("Hola, ¿quién eres?");
  console.log(respuesta);
})();
```
> Todos los métodos devuelven una Promesa y puedes usarlos con await o .then().




---

🌐 Uso vía navegador o curl
```
curl -H "ngrok-skip-browser-warning: true" "https://9820-74-249-85-193.ngrok-free.app/api/gemini?message=Hola"
```

---

📚 Endpoints disponibles

```
const nightapi = require("nightapi-js");

// Gemini IA
await nightapi.gemini("Hola, ¿cómo estás?");

// Chiste aleatorio
await nightapi.joke();

// Frase aleatoria
await nightapi.quote();

// Clima actual
await nightapi.weatherCurrent("Lima");

// Pronóstico del clima (en días)
await nightapi.weatherForecast("Lima", 3);

// Noticias por categoría
await nightapi.newsLatest("technology");

// Buscar noticias
await nightapi.newsSearch("inteligencia artificial");

// Tasas de cambio
await nightapi.currencyRates("USD");

// Convertir moneda
await nightapi.currencyConvert("USD", "PEN", 100);

// Generar imagen
await nightapi.imageGenerate("ciudad futurista de noche");

// Redimensionar imagen
await nightapi.imageResize("https://ejemplo.com/imagen.jpg", 300, 300);

// Registro de usuario
await nightapi.authRegister();

// Login de usuario
await nightapi.authLogin();

// Validar token
await nightapi.authValidate();

// Geocodificación
await nightapi.geocode("Avenida Brasil 123, Lima");

// Geocodificación inversa
await nightapi.reverseGeocode(-12.0464, -77.0428);

// Traducir texto
await nightapi.translate("Hola mundo", "es", "en");

// Listar idiomas
await nightapi.languages();

// Acortar URL
await nightapi.shortenUrl("https://miwebsuperlarga.com");

// Información de URL
await nightapi.urlInfo("abc123");

// Descargar audio de YouTube
await nightapi.ytAudio("https://youtube.com/watch?v=xxxx");

// Descargar video de YouTube
await nightapi.ytVideo("https://youtube.com/watch?v=xxxx", "720p");

// Texto a voz
await nightapi.tts("Hola soy un bot", "es");

// Buscar en SoundCloud
await nightapi.soundcloudSearch("Lo-Fi");

// Descargar de SoundCloud
await nightapi.soundcloudDownload("https://soundcloud.com/lofi");

// Buscar GIF
await nightapi.gifSearch("anime");

// GIF aleatorio
await nightapi.gifRandom("memes");

// Chat con Simi
await nightapi.simi("Hola", "es");

// Mezclar emojis
await nightapi.emojimix("❤️", "🔥");

// Imagen estilo DALL·E
await nightapi.dalle("gato con gafas espaciales");

// Búsqueda en Google
await nightapi.googleSearch("Qué es Node.js");

// QuoteSticker
await nightapi.quoteSticker("Soy un bot", "Maycol", "https://avatar.com/foto.png");
```

---

⚡ Lista completa de métodos disponibles
```
NightAPI = {
  gemini(message),
  joke(),
  quote(),
  weatherCurrent(location),
  weatherForecast(location, days),
  newsLatest(category),
  newsSearch(query),
  currencyRates(base),
  currencyConvert(from, to, amount),
  imageGenerate(prompt),
  imageResize(url, width, height),
  authRegister(),
  authLogin(),
  authValidate(),
  geocode(address),
  reverseGeocode(lat, lon),
  translate(text, from, to),
  languages(),
  shortenUrl(url),
  urlInfo(code),
  ytAudio(url),
  ytVideo(url, quality),
  tts(text, lang),
  soundcloudSearch(query),
  soundcloudDownload(url),
  gifSearch(query),
  gifRandom(query),
  simi(text, language),
  emojimix(emoji1, emoji2),
  dalle(prompt),
  googleSearch(query),
  quoteSticker(text, name, avatar)
}
```

---

❌ Errores comunes

> {"error":"Bad Request","message":"Message parameter is required"}
¿Qué pasó?
Olvidaste poner ?message= en tu URL.

---

✨ Tips y curiosidades

Puedes combinar esta API con tu bot de WhatsApp o Telegram.

Los endpoints pueden usarse desde frontend, backends o incluso bash scripts.

Es ideal para proyectos personales, demos o apps sin complicaciones.



---

☎️ Contacto y soporte

¿Quieres proponer nuevos endpoints, colaborar o integrar esta API en tu bot?

> Escríbeme al +51 921 826 291 o vía Telegram: @soymaycol




---

⭐ ¡Apoya el proyecto!

Si te gustó este pack mágico nocturno…

¡Dale una estrella y compártelo!
Cada estrella ilumina un nuevo endpoint.


---

<p align="center">
  <img src="https://files.catbox.moe/9zq2i4.png" width="300"/>
</p>
