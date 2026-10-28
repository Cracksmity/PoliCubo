/**
 * ChatTest.jsx
 * Test conversacional con IA (modos guiado y libre).
 *
 * En cada turno la IA puntúa la última respuesta por eje (con confianza) y la
 * app agrega esas puntuaciones: la posición provisional se mueve en el cubo
 * mientras respondes y la final es reproducible (lib/political.js).
 * Los mensajes de error se muestran en el chat pero nunca se envían al modelo.
 */
import { useEffect, useRef, useState } from 'react';
import { Send, RefreshCw } from 'lucide-react';

import { aggregateScores, nearestIdeologies, describePosition } from '../../lib/political';

const MAX_QUESTIONS = 12;
const TIMEOUT_MS = 35000; // tiempo para dar margen a la IA
const FREE_WELCOME = '¡Bienvenido al test conversacional (Modo Libre)! Cuéntame, ¿cuál es tu postura ideal sobre el papel del gobierno en la sociedad?';
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

const scoresOf = (msgs) => msgs.filter((m) => m.role === 'user' && m.score).map((m) => m.score);

/** Devuelve una copia con la puntuación puesta en el último mensaje del usuario */
function attachScore(msgs, score) {
  if (!score) return msgs;
  const idx = msgs.map((m) => m.role).lastIndexOf('user');
  if (idx < 0) return msgs;
  return msgs.map((m, i) => (i === idx ? { ...m, score } : m));
}

/** Pares pregunta → respuesta → puntuación, para «Cómo se calculó» */
function breakdown(msgs) {
  const rows = [];
  let lastQuestion = null;
  for (const m of msgs) {
    if (m.isError) continue;
    if (m.role === 'ai') lastQuestion = m.text;
    else rows.push({ question: lastQuestion, answer: m.text, score: m.score || null });
  }
  return rows;
}

export default function ChatTest({ mode, onProgress, onFinish, onStep }) {
  const [messages, setMessages] = useState(() => (mode === 'free' ? [{ role: 'ai', text: FREE_WELCOME }] : []));
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const requestRef = useRef(null); // AbortController de la petición en curso
  const startedRef = useRef(false);
  const endRef = useRef(null);
  const textareaRef = useRef(null);

  const questionsAsked = messages.filter((m) => m.role === 'ai' && !m.isError).length;

  useEffect(() => {
    onStep({ current: Math.min(Math.max(questionsAsked, 1), MAX_QUESTIONS), total: MAX_QUESTIONS });
  }, [questionsAsked, onStep]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-iniciar el modo guiado: el servidor genera la primera pregunta sin que cuente como respuesta
  useEffect(() => {
    if (mode === 'guided' && !startedRef.current) {
      startedRef.current = true;
      requestNext([]);
    }
    // Solo al montar
  }, []);

  /** Pide a la IA el siguiente paso de la conversación */
  const requestNext = async (history) => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setIsLoading(true);

    let timedOut = false;
    const timeoutId = setTimeout(() => { timedOut = true; controller.abort(); }, TIMEOUT_MS);

    try {
      const provisional = aggregateScores(scoresOf(history));
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.filter((m) => !m.isError).map(({ role, text }) => ({ role, text })),
          mode,
          provisional: provisional.n > 0 ? provisional : null,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error en el servidor');
      }

      const data = await response.json();
      if (requestRef.current !== controller) return; // descartada

      // La puntuación corresponde a la última respuesta enviada
      const scored = attachScore(history, data.evaluacion_respuesta);
      const position = aggregateScores(scoresOf(scored));
      if (position.n > 0) onProgress({ x: position.x, y: position.y, z: position.z });

      if (data.status === 'finalizado') {
        const coords = { x: position.x, y: position.y, z: position.z };
        const [nearest] = nearestIdeologies(coords, 1);
        setMessages(scored);
        onFinish({
          mode,
          date: new Date().toISOString(),
          name: data.nombre_ideologia || `Afín a ${nearest.ideology.name}`,
          description: data.descripcion_personalizada || describePosition(coords),
          color: HEX_COLOR.test(data.color_hex || '') ? data.color_hex : nearest.ideology.color,
          coords,
          reasoning: data.razonamiento_coordenadas,
          answers: breakdown(scored),
        });
      } else if (data.siguiente_pregunta) {
        setMessages([...scored, { role: 'ai', text: data.siguiente_pregunta, opciones: data.opciones }]);
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (err) {
      if (requestRef.current !== controller) return; // petición descartada a propósito
      console.error('Error fetching chat:', err);
      const text = timedOut ? 'El oráculo tardó demasiado en responder (timeout).' : `Error de conexión: ${err.message}`;
      setMessages((prev) => [...prev, { role: 'ai', text, isError: true }]);
    } finally {
      clearTimeout(timeoutId);
      if (requestRef.current === controller) {
        requestRef.current = null;
        setIsLoading(false);
      }
    }
  };

  const send = (text) => {
    const textToSend = typeof text === 'string' ? text : input;
    if (!textToSend.trim() || isLoading) return;
    const next = [...messages.filter((m) => !m.isError), { role: 'user', text: textToSend }];
    setMessages(next);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = '';
    requestNext(next);
  };

  /** Reenvía la conversación quitando los mensajes de error */
  const retry = () => {
    const history = messages.filter((m) => !m.isError);
    setMessages(history);
    requestNext(history);
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = '';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div className="chat-test">
      <div className="messages-history">
        {messages.map((msg, i) => {
          const isLast = i === messages.length - 1;
          return (
            <div key={i} className={`chat-bubble ${msg.role} ${msg.isError ? 'error' : ''}`}>
              {msg.text}

              {/* Reintentar tras un error (el error no se envía a la IA) */}
              {msg.isError && isLast && !isLoading && (
                <div className="bubble-actions">
                  <button className="btn btn-small btn-danger" onClick={retry}>
                    <RefreshCw size={14} aria-hidden="true" /> Reintentar
                  </button>
                </div>
              )}

              {/* Opciones del Modo Guiado (Quick Replies) */}
              {Array.isArray(msg.opciones) && msg.opciones.length > 0 && isLast && !isLoading && (
                <div className="quick-replies">
                  <p className="quick-replies-hint">Elige una opción o escribe la tuya:</p>
                  {msg.opciones.map((opcion, idx) => (
                    <button key={idx} className="quick-reply" onClick={() => send(opcion)}>
                      {opcion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="chat-bubble ai loading" aria-live="polite">
            <span className="loading-dots">Analizando</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="chat-input">
        <textarea
          ref={textareaRef}
          value={input}
          disabled={isLoading}
          onChange={handleInput}
          rows={1}
          aria-label="Tu respuesta"
          placeholder={mode === 'guided' ? 'O si prefieres, escribe tu propia respuesta aquí…' : 'Escribe tu respuesta aquí…'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          data-autofocus={mode === 'free' ? true : undefined}
        />
        <button className="btn btn-primary chat-send" onClick={send} disabled={isLoading || !input.trim()} aria-label="Enviar">
          <Send size={16} aria-hidden="true" /> <span className="chat-send-label">Enviar</span>
        </button>
      </div>
    </div>
  );
}
