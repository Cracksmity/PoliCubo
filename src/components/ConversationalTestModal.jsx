import { useState, useRef, useEffect } from 'react';

export default function ConversationalTestModal({ isOpen, onClose }) {
  const [testMode, setTestMode] = useState(null); // 'free' | 'guided'
  const [testMessage, setTestMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const requestRef = useRef(null); // AbortController de la petición en curso

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isLoading]);

  /** Vuelve a la selección de modo, descartando cualquier respuesta pendiente */
  const resetTest = () => {
    requestRef.current?.abort();
    requestRef.current = null;
    setIsLoading(false);
    setIsFinished(false);
    setTestMode(null);
    setMessages([]);
    setTestMessage('');
  };

  /**
   * Pide a la IA el siguiente paso de la conversación.
   * Los mensajes de error se muestran en el chat pero nunca se envían al modelo.
   * `mode` se pasa explícito porque al elegir modo el estado aún no se ha actualizado.
   */
  const requestNext = async (history, mode = testMode) => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setIsLoading(true);

    let timedOut = false;
    const timeoutId = setTimeout(() => { timedOut = true; controller.abort(); }, 35000); // 35s timeout para dar tiempo a la IA

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.filter(m => !m.isError), mode }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error en el servidor');
      }

      const data = await response.json();
      if (requestRef.current !== controller) return; // el test se reinició mientras tanto

      if (data.status === 'en_progreso' && data.siguiente_pregunta) {
        setMessages(prev => [...prev, { role: 'ai', text: data.siguiente_pregunta, opciones: data.opciones }]);
      } else if (data.status === 'finalizado' && data.coordenadas) {
        const { x, y, z } = data.coordenadas;
        const nombreIdeologia = data.nombre_ideologia || '';
        const descripcion = data.descripcion_personalizada || '';
        const razonamiento = data.razonamiento_coordenadas
          ? `\n\n🔎 Por qué estas coordenadas: ${data.razonamiento_coordenadas}`
          : '';

        setMessages(prev => [
          ...prev,
          {
            role: 'ai',
            text: `¡Test Finalizado!\n\n🧠 Ideología detectada: ${nombreIdeologia}\n\n${descripcion}\n\n📍 Coordenadas mapeadas: X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}, Z: ${z.toFixed(2)}${razonamiento}`
          }
        ]);
        setIsFinished(true);

        window.dispatchEvent(new CustomEvent('addUserNode', { detail: data }));
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (err) {
      if (requestRef.current !== controller) return; // petición descartada a propósito
      console.error('Error fetching chat:', err);
      const text = timedOut
        ? 'El oráculo tardó demasiado en responder (timeout).'
        : `Error de conexión: ${err.message}`;
      setMessages(prev => [...prev, { role: 'ai', text, isError: true }]);
    } finally {
      clearTimeout(timeoutId);
      if (requestRef.current === controller) {
        requestRef.current = null;
        setIsLoading(false);
      }
    }
  };

  const handleSelectMode = (mode) => {
    setTestMode(mode);
    setIsFinished(false);
    if (mode === 'guided') {
      // Auto-iniciar la conversación: el servidor genera la primera pregunta sin que cuente como respuesta
      setMessages([]);
      requestNext([], mode);
    } else {
      const welcomeText = '¡Bienvenido al test conversacional (Modo Libre)! Cuéntame, ¿cuál es tu postura ideal sobre el papel del gobierno en la sociedad?';
      setMessages([{ role: 'ai', text: welcomeText }]);
    }
  };

  const handleSendMessage = (forcedText = null) => {
    // Permite usar el botón directamente saltando el input
    const textToSend = typeof forcedText === 'string' ? forcedText : testMessage;

    if (!textToSend.trim() || isLoading || isFinished) return;

    const newMessages = [...messages, { role: 'user', text: textToSend }];
    setMessages(newMessages);
    setTestMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px'; // reset height after send
    }
    requestNext(newMessages);
  };

  /** Reenvía la conversación quitando los mensajes de error */
  const handleRetry = () => {
    const history = messages.filter(m => !m.isError);
    setMessages(history);
    requestNext(history);
  };

  const handleInput = (e) => {
    setTestMessage(e.target.value);
    e.target.style.height = '48px';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  if (!isOpen) return null;

  // Pantallas estrechas: tarjetas de modo apiladas y más compactas
  const compact = window.innerWidth < 600;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.2)', // Más transparente para ver el cubo
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      pointerEvents: 'none' // Permite que los clics pasen al canvas 3D
    }}>
      <div style={{
        background: 'rgba(15, 20, 35, 0.85)', // Fondo oscuro para dar contraste y que sea legible
        backdropFilter: 'blur(16px)', // Desenfoque aplicado SOLO a la ventana, no a toda la pantalla
        border: '1px solid var(--border-glass)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '700px',
        height: '80vh',
        maxHeight: '800px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(244, 63, 94, 0.1)',
        overflow: 'hidden',
        pointerEvents: 'auto' // Reactiva los clics solo para la ventana del modal
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {testMode && (
              <button
                onClick={resetTest}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '8px',
                  color: 'var(--text-muted)',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  transition: 'all 0.2s',
                  lineHeight: 1
                }}
                title="Cambiar de modo"
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
              >
                ←
              </button>
            )}
            <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
              <span style={{ fontSize: '1.5rem' }}>🤖</span> Test Conversacional
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.8rem',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '0 5px',
              transition: 'color 0.2s'
            }}
            title="Cerrar test"
            onMouseEnter={e => e.target.style.color = 'var(--accent-rose)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
          >
            ×
          </button>
        </div>

        {!testMode ? (
          // Selección de Modo
          // 'safe center': si no cabe (móvil), el contenido empieza arriba en vez de cortarse
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'safe center', alignItems: 'center', padding: compact ? '24px 16px' : '40px', textAlign: 'center', overflowY: 'auto' }}>
            <h3 style={{ fontSize: compact ? '1.4rem' : '1.8rem', marginBottom: '15px', color: 'var(--text-primary)', fontWeight: '700' }}>¿Cómo prefieres hacer el test?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: compact ? '24px' : '40px', maxWidth: '500px', fontSize: compact ? '0.95rem' : '1.05rem', lineHeight: '1.6' }}>
              Elige el modo que mejor se adapte a ti. No te preocupes, el resultado final será igual de preciso en ambos casos.
            </p>

            <div style={{ display: 'flex', gap: compact ? '14px' : '24px', flexDirection: compact ? 'column' : 'row', width: compact ? '100%' : 'auto', maxWidth: '544px' }}>
              <button 
                onClick={() => handleSelectMode('guided')}
                style={{
                  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.08) 0%, rgba(14, 165, 233, 0.12) 100%)',
                  border: '1px solid rgba(34, 211, 238, 0.4)',
                  borderRadius: '20px',
                  padding: compact ? '20px 18px' : '35px 25px',
                  width: compact ? '100%' : '260px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(34, 211, 238, 0.15)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(14, 165, 233, 0.2) 100%)'; e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.7)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34, 211, 238, 0.08) 0%, rgba(14, 165, 233, 0.12) 100%)'; e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.4)'; }}
              >
                <span style={{ fontSize: compact ? '2.5rem' : '3.5rem', filter: 'drop-shadow(0 0 10px rgba(34, 211, 238, 0.5))', pointerEvents: 'none' }}>🧭</span>
                <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-cyan)', pointerEvents: 'none' }}>Modo Guiado</span>
                <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.4', pointerEvents: 'none' }}><strong>Recomendado.</strong> Preguntas sobre casos cotidianos con opciones de respuesta rápidas.</span>
              </button>

              <button 
                onClick={() => handleSelectMode('free')}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  padding: compact ? '20px 18px' : '35px 25px',
                  width: compact ? '100%' : '260px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.3)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
              >
                <span style={{ fontSize: compact ? '2.5rem' : '3.5rem', filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.2))', pointerEvents: 'none' }}>✍️</span>
                <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)', pointerEvents: 'none' }}>Modo Libre</span>
                <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.4', pointerEvents: 'none' }}>Para expertos. Preguntas abstractas donde tú redactas tus propios argumentos.</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Messages Area */}
            <div className="messages-history" style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '24px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '18px', 
            }}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.isError ? 'rgba(244, 63, 94, 0.08)' : msg.role === 'user' ? 'rgba(34, 211, 238, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                  color: msg.role === 'user' ? 'var(--accent-cyan)' : 'var(--text-primary)',
                  border: msg.isError ? '1px dashed rgba(244, 63, 94, 0.5)' : msg.role === 'user' ? '1px solid rgba(34, 211, 238, 0.25)' : '1px solid var(--border-glass)',
                  padding: '16px 20px',
                  borderRadius: '18px',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '18px',
                  borderBottomLeftRadius: msg.role !== 'user' ? '4px' : '18px',
                  maxWidth: '85%',
                  fontSize: '0.98rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}>
                  {msg.text}

                  {/* Reintentar tras un error (el error no se envía a la IA) */}
                  {msg.isError && i === messages.length - 1 && !isLoading && (
                    <div style={{ marginTop: '12px' }}>
                      <button
                        onClick={handleRetry}
                        style={{
                          background: 'rgba(244, 63, 94, 0.12)',
                          border: '1px solid rgba(244, 63, 94, 0.4)',
                          borderRadius: '10px',
                          padding: '8px 16px',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                      >
                        ↻ Reintentar
                      </button>
                    </div>
                  )}

                  {/* Opciones del Modo Guiado (Quick Replies) */}
                  {msg.opciones && Array.isArray(msg.opciones) && i === messages.length - 1 && !isLoading && (
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', fontStyle: 'italic' }}>Elige una opción o escribe la tuya:</p>
                      {msg.opciones.map((opcion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(opcion)}
                          style={{
                             background: 'rgba(34, 211, 238, 0.08)',
                             border: '1px solid rgba(34, 211, 238, 0.2)',
                             borderRadius: '12px',
                             padding: '10px 16px',
                             color: 'var(--text-primary)',
                             textAlign: 'left',
                             cursor: 'pointer',
                             transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                             fontSize: '0.95rem',
                             lineHeight: '1.4'
                          }}
                          onMouseEnter={e => { e.target.style.background = 'rgba(34, 211, 238, 0.15)'; e.target.style.borderColor = 'rgba(34, 211, 238, 0.4)'; e.target.style.transform = 'translateX(4px)' }}
                          onMouseLeave={e => { e.target.style.background = 'rgba(34, 211, 238, 0.08)'; e.target.style.borderColor = 'rgba(34, 211, 238, 0.2)'; e.target.style.transform = 'translateX(0)' }}
                        >
                          {opcion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div style={{
                  alignSelf: 'flex-start',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-glass)',
                  padding: '16px 20px',
                  borderRadius: '18px',
                  borderBottomLeftRadius: '4px',
                  fontSize: '0.98rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span className="loading-dots">Analizando</span>
                  <style>{`
                    @keyframes blink { 0% { opacity: .2; } 20% { opacity: 1; } 100% { opacity: .2; } }
                    .loading-dots::after { content: '.'; animation: blink 1.4s infinite both; }
                    .loading-dots::before { content: '.'; animation: blink 1.4s infinite both; animation-delay: 0.2s; position: absolute; margin-left: 1ch; }
                    .loading-dots { position: relative; margin-right: 2ch; }
                  `}</style>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Test terminado: no se puede seguir enviando mensajes */}
            {isFinished && (
              <div style={{
                padding: '20px 24px',
                borderTop: '1px solid var(--border-glass)',
                background: 'rgba(0, 0, 0, 0.3)',
                display: 'flex',
                gap: '16px',
                justifyContent: 'flex-end',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={resetTest}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '14px',
                    padding: '0 24px',
                    height: '52px',
                    color: 'var(--text-primary)',
                    fontWeight: '600',
                    fontSize: '0.98rem',
                    cursor: 'pointer'
                  }}
                >
                  ↺ Repetir test
                </button>
                <button
                  onClick={onClose}
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-cyan) 0%, #0ea5e9 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '0 28px',
                    height: '52px',
                    fontWeight: '700',
                    fontSize: '0.98rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(34, 211, 238, 0.3)'
                  }}
                >
                  Ver mi posición en el cubo
                </button>
              </div>
            )}

            {/* Input Area */}
            {!isFinished && (
            <div style={{
              padding: '20px 24px', 
              borderTop: '1px solid var(--border-glass)',
              background: 'rgba(0, 0, 0, 0.3)',
              display: 'flex', 
              gap: '16px',
              alignItems: 'flex-end'
            }}>
              <textarea
                ref={textareaRef}
                value={testMessage}
                disabled={isLoading}
                onChange={handleInput}
                placeholder={testMode === 'guided' ? "O si prefieres, escribe tu propia respuesta aquí..." : "Escribe tu respuesta aquí..."}
                style={{ 
                  flex: 1, 
                  resize: 'none', 
                  height: '52px', 
                  minHeight: '52px',
                  maxHeight: '160px',
                  padding: '14px 18px', 
                  borderRadius: '14px', 
                  background: 'rgba(255,255,255,0.03)', 
                  color: 'var(--text-primary)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.98rem',
                  lineHeight: '1.5',
                  outline: 'none',
                  overflowY: 'auto',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(34, 211, 238, 0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button 
                onClick={handleSendMessage}
                disabled={isLoading}
                style={{ 
                  background: isLoading ? 'rgba(34, 211, 238, 0.2)' : 'linear-gradient(135deg, var(--accent-cyan) 0%, #0ea5e9 100%)', 
                  color: isLoading ? 'var(--text-muted)' : '#fff', 
                  border: 'none', 
                  borderRadius: '14px', 
                  padding: '0 28px',
                  height: '52px',
                  fontWeight: '700', 
                  fontSize: '0.98rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: isLoading ? 'none' : '0 4px 15px rgba(34, 211, 238, 0.3)'
                }}
                onMouseEnter={e => { if(!isLoading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(34, 211, 238, 0.4)'; } }}
                onMouseLeave={e => { if(!isLoading) { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(34, 211, 238, 0.3)'; } }}
              >
                Enviar
              </button>
            </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
