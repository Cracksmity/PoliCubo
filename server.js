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

const MODEL = process.env.OPENAI_MODEL || 'gpt-6-luna';
// Algunos modelos (como gpt-5.6-luna) solo aceptan la temperatura por defecto:
// solo se envía si se configura expresamente (p. ej. OPENAI_TEMPERATURE=0.3 con gpt-4o-mini)
const TEMPERATURE = process.env.OPENAI_TEMPERATURE ? Number(process.env.OPENAI_TEMPERATURE) : undefined;
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

// Reglas comunes: la IA puntúa cada respuesta y la app agrega las puntuaciones.
// Así la posición final es reproducible y explicable (no tres números al final).
const SCORING_RULES = `
Puntuación por respuesta (OBLIGATORIO en cada turno):
- En "evaluacion_respuesta" puntúa SOLO el último mensaje del usuario, en los ejes que esa respuesta revela. Usa null en los ejes sobre los que no dice nada.
- Valores entre -1.0 y 1.0 con precisión decimal (ej. 0.3, -0.6, 0.85). Reserva los extremos (1.0 o -1.0) para posturas radicales o fanáticas; para la mayoría de respuestas usa valores moderados que reflejen sus matices.
- "confianza" entre 0 y 1: cuánto revela de verdad la respuesta. Una respuesta ambigua, muy corta o evasiva tiene confianza baja.
- "explicacion": una frase breve que justifique la puntuación.
- Si todavía no hay ninguna respuesta del usuario que puntuar, "evaluacion_respuesta" debe ser null.
- La app calcula la posición como la media ponderada (por confianza) de tus puntuaciones. Recibirás la posición provisional en un mensaje de sistema.
Al finalizar: "nombre_ideologia", "descripcion_personalizada" y "razonamiento_coordenadas" deben ser coherentes con la posición provisional más la puntuación de la última respuesta. No inventes coordenadas distintas.`;

const FREE_SYSTEM_PROMPT = `Actúas como un psicómetra político y filósofo experto. Tu objetivo es entrevistar al usuario con preguntas abiertas, cortas y enfocadas (una a la vez) para mapear su ideología en PoliCubo, un espacio interactivo 3D con tres ejes que van de -1.0 a 1.0:
- Eje X: Económico (Izquierda/Comunismo [-1.0] | Centro/Distributismo [0.0] | Derecha/Libre Mercado [1.0])
- Eje Y: Social/Político (Libertario/Anarquía [-1.0] | Autoritario/Estatal [1.0])
- Eje Z: Pluralidad/Profundidad (Monismo/Exclusión [-1.0] | Pluralismo/Inclusión [1.0])

Pauta de calibración: Sé capaz de mapear combinaciones ideológicas complejas con precisión a lo largo de los ejes, sin forzar a los usuarios a cuadrantes tradicionales. Si detectas que el usuario es apático, no toma postura y le da igual la política, puntúa sus respuestas cerca de 0, clasifica su ideología como 'Tibio / Apático', y en la descripción repréndelo de forma sutil citando Apocalipsis 3:16 ('por cuanto eres tibio...').

Reglas Importantes:
1. Durante la entrevista (máximo 12 preguntas), explora activamente los 3 ejes. Si el usuario se enfoca en un solo eje, cambia el tema de tu siguiente pregunta hacia los otros ejes.
2. MODO MANIFIESTO: Si el usuario envía desde el principio un texto muy largo y detallado sobre sus posturas políticas, NO hagas preguntas. Puntúa ese texto en los tres ejes y responde inmediatamente con status: 'finalizado'.
3. Tu respuesta SIEMPRE será un objeto JSON válido con los campos requeridos.
${SCORING_RULES}`;

const GUIDED_SYSTEM_PROMPT = `Actúas como un psicómetra amigable e intuitivo. Tu objetivo es entrevistar al usuario (máximo 12 preguntas cortas, una a la vez) para mapear su ideología en PoliCubo.
Ejes a mapear (de -1.0 a 1.0):
- Eje X: Económico (Control estatal [-1.0] | Libre Mercado [1.0])
- Eje Y: Social/Político (Libertades individuales [-1.0] | Autoridad estatal [1.0])
- Eje Z: Pluralidad (Exclusión/Nacionalismo [-1.0] | Inclusión/Globalismo [1.0])

Reglas Importantes para Modo Guiado:
1. NUNCA uses jerga política (evita palabras como comunismo, distributismo, monismo, etc. durante las preguntas).
2. Usa escenarios de la vida real o cotidianos (ej. "Imagina que sube el precio del pan...", "Si el gobierno quiere construir un hospital...").
3. DEBES sugerir entre 2 y 4 opciones de respuesta cortas para que el usuario pueda elegir. Estas opciones deben reflejar posturas opuestas de forma sencilla. Rellena el arreglo "opciones" en el JSON con estas sugerencias.
4. Reparte las preguntas entre los 3 ejes.
5. Si el usuario es apático, puntúa sus respuestas cerca de 0, clasifícalo como 'Tibio / Apático' y repréndelo sutilmente citando Apocalipsis 3:16.
${SCORING_RULES}`;

const nullableNumber = (description) => ({ type: ['number', 'null'], description });

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: ['en_progreso', 'finalizado'],
      description: 'Estado de la conversación.',
    },
    evaluacion_respuesta: {
      type: ['object', 'null'],
      description: 'Puntuación del último mensaje del usuario (null si aún no ha respondido nada).',
      properties: {
        x: nullableNumber('Eje económico, -1.0 a 1.0, o null si la respuesta no habla de ello'),
        y: nullableNumber('Eje social/político, -1.0 a 1.0, o null'),
        z: nullableNumber('Eje de pluralidad, -1.0 a 1.0, o null'),
        confianza: { type: 'number', description: 'De 0 a 1: cuánto revela la respuesta' },
        explicacion: { type: 'string', description: 'Una frase que justifique la puntuación' },
      },
      required: ['x', 'y', 'z', 'confianza', 'explicacion'],
      additionalProperties: false,
    },
    siguiente_pregunta: {
      type: ['string', 'null'],
      description: "La siguiente pregunta a hacer al usuario si status es 'en_progreso'.",
    },
    opciones: {
      type: ['array', 'null'],
      items: { type: 'string' },
      description: 'Sugerencias de respuesta corta para el usuario (solo para modo guiado).',
    },
    razonamiento_coordenadas: {
      type: ['string', 'null'],
      description: "Si status es 'finalizado': explica brevemente la posición final y por qué no es más extrema, basándote en los matices del usuario.",
    },
    nombre_ideologia: {
      type: ['string', 'null'],
      description: "Nombre de la ideología detectada si status es 'finalizado'.",
    },
    descripcion_personalizada: {
      type: ['string', 'null'],
      description: "Descripción breve y personalizada del perfil si status es 'finalizado'.",
    },
    color_hex: {
      type: ['string', 'null'],
      description: "Color hexadecimal claro y visible sobre fondo oscuro para representar al usuario (ej. #ff4d6d) si status es 'finalizado'.",
    },
  },
  required: [
    'status', 'evaluacion_respuesta', 'siguiente_pregunta', 'opciones',
    'razonamiento_coordenadas', 'nombre_ideologia', 'descripcion_personalizada', 'color_hex',
  ],
  additionalProperties: false,
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/** Normaliza la puntuación del modelo: ejes en [-1, 1] o null, confianza en [0, 1] */
function sanitizeEvaluation(ev) {
  if (!ev || typeof ev !== 'object') return null;
  const axis = (v) => (Number.isFinite(v) ? Math.round(clamp(v, -1, 1) * 100) / 100 : null);
  const out = {
    x: axis(ev.x),
    y: axis(ev.y),
    z: axis(ev.z),
    confianza: Number.isFinite(ev.confianza) ? clamp(ev.confianza, 0, 1) : 0.5,
    explicacion: typeof ev.explicacion === 'string' ? ev.explicacion.slice(0, 400) : '',
  };
  return out.x === null && out.y === null && out.z === null ? null : out;
}

/** Posición provisional enviada por el cliente (solo orienta al modelo) */
function parseProvisional(p) {
  if (!p || typeof p !== 'object') return null;
  const vals = [p.x, p.y, p.z].map(Number);
  const n = Number(p.n);
  if (!vals.every(Number.isFinite) || !Number.isFinite(n) || n <= 0) return null;
  const [x, y, z] = vals.map((v) => clamp(v, -1, 1).toFixed(2));
  return { x, y, z, n: Math.min(Math.round(n), 50) };
}

app.post('/api/chat', rateLimit, async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ error: 'El servidor no tiene configurada la clave de OpenAI.' });
    }

    const { messages, mode, provisional } = req.body ?? {};

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

    const prov = parseProvisional(provisional);
    if (prov) {
      conversation.push({
        role: 'system',
        content: `Posición provisional calculada por la app a partir de ${prov.n} respuestas ya puntuadas: X=${prov.x}, Y=${prov.y}, Z=${prov.z}. Puntúa ahora solo el último mensaje del usuario.`
      });
    }

    // El modo guiado arranca sin mensajes: pedimos la primera pregunta sin que cuente como respuesta
    if (formattedMessages.length === 0) {
      conversation.push({ role: 'user', content: 'Empecemos el test.' });
    }

    if (userMessageCount >= 12) {
      conversation.push({
        role: 'system',
        content: "El usuario ha respondido la 12va pregunta. DEBES finalizar el test ahora mismo obligatoriamente. Puntúa su última respuesta y genera status: 'finalizado' con el nombre, la descripción y el razonamiento finales."
      });
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      ...(Number.isFinite(TEMPERATURE) && { temperature: TEMPERATURE }),
      messages: conversation,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'political_test_response',
          strict: true,
          schema: RESPONSE_SCHEMA,
        },
      },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ error: 'El oráculo no devolvió respuesta. Intenta de nuevo.' });
    }
    const parsedData = JSON.parse(content);

    // Sin respuesta del usuario no hay nada que puntuar
    parsedData.evaluacion_respuesta = userMessageCount > 0 ? sanitizeEvaluation(parsedData.evaluacion_respuesta) : null;

    if (parsedData.status === 'en_progreso' && !parsedData.siguiente_pregunta) {
      return res.status(502).json({ error: 'El oráculo no devolvió la siguiente pregunta. Intenta de nuevo.' });
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
