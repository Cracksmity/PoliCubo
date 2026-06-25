import { useState, useRef, useEffect } from 'react';

export default function ConversationalTestModal({ isOpen, onClose }) {
  const [testMessage, setTestMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: '¡Bienvenido al test conversacional! Cuéntame, ¿cuál es tu postura ideal sobre el papel del gobierno en la sociedad?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!testMessage.trim() || isLoading) return;
    
    const newMessages = [...messages, { role: 'user', text: testMessage }];
    setMessages(newMessages);
    setTestMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px'; // reset height after send
    }
    setIsLoading(true);

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 15000); // 15s timeout

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
        signal: abortController.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error en el servidor');
      }

      const data = await response.json();
      
      if (data.status === 'en_progreso') {
        setMessages(prev => [...prev, { role: 'ai', text: data.siguiente_pregunta }]);
      } else if (data.status === 'finalizado') {
        const { x, y, z } = data.coordenadas;
        const nombreIdeologia = data.nombre_ideologia || '';
        const descripcion = data.descripcion_personalizada || '';

        setMessages(prev => [
          ...prev, 
          { 
            role: 'ai', 
            text: `¡Test Finalizado!\n\n🧠 Ideología detectada: ${nombreIdeologia}\n\n${descripcion}\n\n📍 Coordenadas mapeadas: X: ${x}, Y: ${y}, Z: ${z}` 
          }
        ]);
        
        window.dispatchEvent(new CustomEvent('addUserNode', { detail: data }));
      }
    } catch (err) {
      console.error('Error fetching chat:', err);
      if (err.name === 'AbortError') {
        setMessages(prev => [...prev, { role: 'ai', text: 'El oráculo tardó demasiado en responder (timeout). Por favor, intenta de nuevo.' }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: `Error de conexión: ${err.message}. Verifica tu configuración.` }]);
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const handleInput = (e) => {
    setTestMessage(e.target.value);
    e.target.style.height = '48px';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(6px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-glass)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '700px',
        height: '80vh',
        maxHeight: '800px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(244, 63, 94, 0.1)',
        overflow: 'hidden'
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
            <span style={{ fontSize: '1.5rem' }}>🤖</span> Test Conversacional
          </h2>
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

        {/* Messages */}
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
              background: msg.isEasterEgg ? 'rgba(50, 50, 50, 0.4)' : msg.role === 'user' ? 'rgba(34, 211, 238, 0.12)' : 'rgba(255, 255, 255, 0.04)',
              color: msg.isEasterEgg ? '#888' : msg.role === 'user' ? 'var(--accent-cyan)' : 'var(--text-primary)',
              border: msg.isEasterEgg ? '1px dashed #555' : msg.role === 'user' ? '1px solid rgba(34, 211, 238, 0.25)' : '1px solid var(--border-glass)',
              padding: '16px 20px',
              borderRadius: '18px',
              borderBottomRightRadius: msg.role === 'user' ? '4px' : '18px',
              borderBottomLeftRadius: msg.role !== 'user' ? '4px' : '18px',
              maxWidth: '85%',
              fontSize: '0.98rem',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              fontStyle: msg.isEasterEgg ? 'italic' : 'normal',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              {msg.text}
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

        {/* Input Area */}
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
            placeholder="Escribe tu respuesta aquí..."
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
                handleSendMessage();
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
      </div>
    </div>
  );
}
