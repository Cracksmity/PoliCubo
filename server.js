import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FREE_SYSTEM_PROMPT = `Actúas como un psicómetra político y filósofo experto. Tu objetivo es entrevistar al usuario con preguntas abiertas, cortas y enfocadas (una a la vez) para mapear su ideología en PoliCubo, un espacio interactivo 3D con tres ejes que van de -1.0 a 1.0:
- Eje X: Económico (Izquierda/Comunismo [-1.0] | Centro/Distributismo [0.0] | Derecha/Libre Mercado [1.0])
- Eje Y: Social/Político (Libertario/Anarquía [-1.0] | Autoritario/Estatal [1.0])
- Eje Z: Pluralidad/Profundidad (Monismo/Exclusión [-1.0] | Pluralismo/Inclusión [1.0])

Pauta de calibración: Sé capaz de mapear combinaciones ideológicas complejas con precisión a lo largo de los ejes, sin forzar a los usuarios a cuadrantes tradicionales. Si detectas que el usuario es apático, no toma postura y le da igual la política, deberás devolver coordenadas cercanas a 0,0,0, clasificar su ideología como 'Tibio / Apático', y en la descripción reprenderlo de forma sutil citando Apocalipsis 3:16 ('por cuanto eres tibio...').

Reglas Importantes:
1. Durante la entrevista (máximo 5 preguntas), explora activamente los 3 ejes. Si el usuario se enfoca en un solo eje, cambia el tema de tu siguiente pregunta hacia los otros ejes.
2. MODO MANIFIESTO: Si el usuario envía desde el principio un texto muy largo y detallado sobre sus posturas políticas, NO hagas preguntas. Extrae sus coordenadas directamente de su texto y responde inmediatamente con status: 'finalizado'. Tu respuesta SIEMPRE será un objeto JSON válido con los campos requeridos.`;

const GUIDED_SYSTEM_PROMPT = `Actúas como un psicómetra amigable e intuitivo. Tu objetivo es entrevistar al usuario (máximo 5 preguntas cortas, una a la vez) para mapear su ideología en PoliCubo. 
Ejes a mapear (de -1.0 a 1.0):
- Eje X: Económico (Control estatal [-1.0] | Libre Mercado [1.0])
- Eje Y: Social/Político (Libertades individuales [-1.0] | Autoridad estatal [1.0])
- Eje Z: Pluralidad (Exclusión/Nacionalismo [-1.0] | Inclusión/Globalismo [1.0])

Reglas Importantes para Modo Guiado:
1. NUNCA uses jerga política (evita palabras como comunismo, distributismo, monismo, etc. durante las preguntas).
2. Usa escenarios de la vida real o cotidianos (ej. "Imagina que sube el precio del pan...", "Si el gobierno quiere construir un hospital...").
3. DEBES sugerir entre 2 y 4 opciones de respuesta cortas para que el usuario pueda elegir. Estas opciones deben reflejar posturas opuestas de forma sencilla. Rellena el arreglo "opciones" en el JSON con estas sugerencias.
4. Mapeo final: Sé preciso. Si el usuario es apático, clasifícalo como 'Tibio / Apático' en 0,0,0 y repréndelo sutilmente citando Apocalipsis 3:16.`;

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, mode } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const currentPrompt = mode === 'guided' ? GUIDED_SYSTEM_PROMPT : FREE_SYSTEM_PROMPT;

    // Adaptar mensajes de frontend (role: 'user' | 'ai') a formato de OpenAI (role: 'user' | 'assistant')
    // y truncar textos muy largos
    const formattedMessages = messages.map(m => ({
      role: m.role === 'ai' ? 'assistant' : m.role,
      content: m.text ? m.text.substring(0, 3000) : ''
    }));

    const userMessageCount = formattedMessages.filter(m => m.role === 'user').length;

    const conversation = [
      { role: 'system', content: currentPrompt },
      ...formattedMessages
    ];

    if (userMessageCount >= 5) {
      conversation.push({
        role: 'system',
        content: "El usuario ha respondido la 5ta pregunta. DEBES finalizar el test ahora mismo obligatoriamente. Genera status: 'finalizado' y da las coordenadas y descripción finales."
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
              }
            },
            required: ["status", "siguiente_pregunta", "opciones", "coordenadas", "nombre_ideologia", "descripcion_personalizada"],
            additionalProperties: false
          }
        }
      }
    });

    const parsedData = JSON.parse(completion.choices[0].message.content);
    
    // Clamp coordinates si el test ha finalizado
    if (parsedData.status === 'finalizado' && parsedData.coordenadas) {
      parsedData.coordenadas.x = Math.max(-1, Math.min(1, parsedData.coordenadas.x));
      parsedData.coordenadas.y = Math.max(-1, Math.min(1, parsedData.coordenadas.y));
      parsedData.coordenadas.z = Math.max(-1, Math.min(1, parsedData.coordenadas.z));
    }
    
    res.json(parsedData);

  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'El oráculo está sobrecargado o hubo un error interno. Intenta de nuevo.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
