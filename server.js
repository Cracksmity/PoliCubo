import express from 'express';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
// Sin CORS: en producción el frontend se sirve desde este mismo servidor y en
// desarrollo Vite hace de proxy, así que ningún otro origen debe llamar a la API.
// 'loopback' confía en X-Forwarded-For solo si viene de un proxy local (nginx en el VPS).
app.set('trust proxy', process.env.TRUST_PROXY || 'loopback');
app.use(express.json({ limit: '100kb' }));

const MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-luna';
const MAX_MESSAGES = 40;           // 12 respuestas + preguntas, con margen
const MAX_MESSAGE_CHARS = 3000;

if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠ OPENAI_API_KEY no está definida: /api/chat responderá 503.');
}
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// ── Rate limit en memoria por IP ─────────────────────────────
// Un test completo son ~13 peticiones; por defecto permite ~3 tests cada 15 min.
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = Number(process.env.RATE_LIMIT_MAX) || 40;
const rateHits = new Map(); // ip → { count, resetAt }

function rateLimit(req, res, next) {
  const now = Date.now();
  const entry = rateHits.get(req.ip);
  if (!entry || entry.resetAt <= now) {
    rateHits.set(req.ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return next();
  }
  if (entry.count >= RATE_MAX) {
    res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
    return res.status(429).json({ error: 'Demasiadas peticiones. Espera unos minutos y vuelve a intentarlo.' });
  }
  entry.count++;
  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateHits) {
    if (entry.resetAt <= now) rateHits.delete(ip);
  }
}, RATE_WINDOW_MS).unref();

const FREE_SYSTEM_PROMPT = `Actúas como un psicómetra político y filósofo experto. Tu objetivo es entrevistar al usuario con preguntas abiertas, cortas y enfocadas (una a la vez) para mapear su ideología en PoliCubo, un espacio interactivo 3D con tres ejes que van de -1.0 a 1.0:
- Eje X: Económico (Izquierda/Comunismo [-1.0] | Centro/Distributismo [0.0] | Derecha/Libre Mercado [1.0])
- Eje Y: Social/Político (Libertario/Anarquía [-1.0] | Autoritario/Estatal [1.0])
- Eje Z: Pluralidad/Profundidad (Monismo/Exclusión [-1.0] | Pluralismo/Inclusión [1.0])

Pauta de calibración: Sé capaz de mapear combinaciones ideológicas complejas con precisión a lo largo de los ejes, sin forzar a los usuarios a cuadrantes tradicionales. Si detectas que el usuario es apático, no toma postura y le da igual la política, deberás devolver coordenadas cercanas a 0,0,0, clasificar su ideología como 'Tibio / Apático', y en la descripción reprenderlo de forma sutil citando Apocalipsis 3:16 ('por cuanto eres tibio...').

Reglas Importantes:
1. Durante la entrevista (máximo 12 preguntas), explora activamente los 3 ejes. Si el usuario se enfoca en un solo eje, cambia el tema de tu siguiente pregunta hacia los otros ejes.
2. Calcula las coordenadas usando precisión decimal (ej. 0.3, -0.6, 0.85). Usa los extremos absolutos (1.0 o -1.0) SOLO si el usuario demuestra posturas radicales o extremistas fanáticas. Para la mayoría de las personas, usa valores fraccionarios y moderados que reflejen sus matices.
3. MODO MANIFIESTO: Si el usuario envía desde el principio un texto muy largo y detallado sobre sus posturas políticas, NO hagas preguntas. Extrae sus coordenadas directamente de su texto y responde inmediatamente con status: 'finalizado'. Tu respuesta SIEMPRE será un objeto JSON válido con los campos requeridos.`;

const GUIDED_SYSTEM_PROMPT = `Actúas como un psicómetra amigable e intuitivo. Tu objetivo es entrevistar al usuario (máximo 12 preguntas cortas, una a la vez) para mapear su ideología en PoliCubo. 
Ejes a mapear (de -1.0 a 1.0):
- Eje X: Económico (Control estatal [-1.0] | Libre Mercado [1.0])
- Eje Y: Social/Político (Libertades individuales [-1.0] | Autoridad estatal [1.0])
- Eje Z: Pluralidad (Exclusión/Nacionalismo [-1.0] | Inclusión/Globalismo [1.0])

Reglas Importantes para Modo Guiado:
1. NUNCA uses jerga política (evita palabras como comunismo, distributismo, monismo, etc. durante las preguntas).
2. Usa escenarios de la vida real o cotidianos (ej. "Imagina que sube el precio del pan...", "Si el gobierno quiere construir un hospital...").
3. DEBES sugerir entre 2 y 4 opciones de respuesta cortas para que el usuario pueda elegir. Estas opciones deben reflejar posturas opuestas de forma sencilla. Rellena el arreglo "opciones" en el JSON con estas sugerencias.
4. Mapeo final: Sé preciso. Calcula las coordenadas usando precisión decimal (ej. 0.3, -0.6, 0.85). Usa los extremos absolutos (1.0 o -1.0) SOLO si el usuario demuestra posturas radicales absolutas. Si el usuario es apático, clasifícalo como 'Tibio / Apático' en 0,0,0 y repréndelo sutilmente citando Apocalipsis 3:16.`;

app.post('/api/chat', rateLimit, async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ error: 'El servidor no tiene configurada la clave de OpenAI.' });
    }

    const { messages, mode } = req.body ?? {};

    if (!Array.isArray(messages) || messages.length > MAX_MESSAGES) {
      return res.status(400).json({ error: 'Conversación no válida.' });
    }

    const currentPrompt = mode === 'guided' ? GUIDED_SYSTEM_PROMPT : FREE_SYSTEM_PROMPT;

    // Adaptar mensajes de frontend (role: 'user' | 'ai') a formato de OpenAI (role: 'user' | 'assistant').
    // Cualquier otro rol (p. ej. 'system') se descarta para que el cliente no pueda inyectar instrucciones.
    const formattedMessages = messages
      .filter(m => m && (m.role === 'user' || m.role === 'ai') && typeof m.text === 'string')
      .map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text.substring(0, MAX_MESSAGE_CHARS)
      }));

    const userMessageCount = formattedMessages.filter(m => m.role === 'user').length;

    const conversation = [
      { role: 'system', content: currentPrompt },
      ...formattedMessages
    ];

    // El modo guiado arranca sin mensajes: pedimos la primera pregunta sin que cuente como respuesta
    if (formattedMessages.length === 0) {
      conversation.push({ role: 'user', content: 'Empecemos el test.' });
    }

    if (userMessageCount >= 12) {
      conversation.push({
        role: 'system',
        content: "El usuario ha respondido la 12va pregunta. DEBES finalizar el test ahora mismo obligatoriamente. Genera status: 'finalizado' y da las coordenadas y descripción finales."
      });
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      messages: conversation,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "political_test_response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              status: {
                type: "string",
                enum: ["en_progreso", "finalizado"],
                description: "Estado de la conversación."
              },
              siguiente_pregunta: {
                type: ["string", "null"],
                description: "La siguiente pregunta a hacer al usuario si status es 'en_progreso'."
              },
              opciones: {
                type: ["array", "null"],
                items: { type: "string" },
                description: "Sugerencias de respuesta corta para el usuario (solo para modo guiado)."
              },
              razonamiento_coordenadas: {
                type: ["string", "null"],
                description: "Explica brevemente por qué has elegido esos valores exactos y por qué no son más extremos, basándote en los matices del usuario."
              },
              coordenadas: {
                type: ["object", "null"],
                properties: {
                  x: { type: "number", description: "Rango entre -1.0 y 1.0" },
                  y: { type: "number", description: "Rango entre -1.0 y 1.0" },
                  z: { type: "number", description: "Rango entre -1.0 y 1.0" }
                },
                required: ["x", "y", "z"],
                additionalProperties: false
              },
              nombre_ideologia: {
                type: ["string", "null"],
                description: "Nombre de la ideología detectada si status es 'finalizado'."
              },
              descripcion_personalizada: {
                type: ["string", "null"],
                description: "Descripción breve y personalizada del perfil si status es 'finalizado'."
              },
              color_hex: {
                type: ["string", "null"],
                description: "Color hexadecimal sugerido para representar visualmente la ideología del usuario (ej. #ff0044) si status es 'finalizado'."
              }
            },
            required: ["status", "siguiente_pregunta", "opciones", "razonamiento_coordenadas", "coordenadas", "nombre_ideologia", "descripcion_personalizada", "color_hex"],
            additionalProperties: false
          }
        }
      }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ error: 'El oráculo no devolvió respuesta. Intenta de nuevo.' });
    }
    const parsedData = JSON.parse(content);

    // Clamp coordinates si el test ha finalizado
    if (parsedData.status === 'finalizado') {
      const coords = parsedData.coordenadas;
      if (!coords || ![coords.x, coords.y, coords.z].every(Number.isFinite)) {
        return res.status(502).json({ error: 'El oráculo devolvió un resultado incompleto. Intenta de nuevo.' });
      }
      coords.x = Math.max(-1, Math.min(1, coords.x));
      coords.y = Math.max(-1, Math.min(1, coords.y));
      coords.z = Math.max(-1, Math.min(1, coords.z));
    }

    res.json(parsedData);

  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'El oráculo está sobrecargado o hubo un error interno. Intenta de nuevo.' });
  }
});

// Servir archivos estáticos del frontend en producción
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'dist')));

app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
