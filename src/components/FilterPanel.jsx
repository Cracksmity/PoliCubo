/**
 * FilterPanel.jsx
 * Panel de UI 2D (HTML) para filtrar y buscar corrientes ideológicas.
 * También incluye la interfaz del Test Conversacional.
 *
 * Controles:
 * 1. Buscador de texto libre (filtra por nombre)
 * 2. Slider de umbral del eje Z (Pluralidad)
 * 3. Lista de nodos con indicador de color y toggle
 */
import { useState, useRef, useEffect } from 'react';

export default function FilterPanel({
  ideologies,
  search,
  onSearchChange,
  zThreshold,
  onZThresholdChange,
  activeIds,
  onToggleNode,
  isOpen,
  onTogglePanelOpen,
  onOpenTest,
}) {
  // Ideologías filtradas por búsqueda
  const filtered = ideologies.filter((id) =>
    id.name.toLowerCase().includes(search.toLowerCase())
  );

  // Calcula si un nodo pasa el filtro de Z
  const passesZ = (ideology) => ideology.coords.z >= zThreshold;

  return (
    <>
      {/* Botón toggle del panel */}
      <button
        id="panel-toggle-btn"
        className={`panel-toggle ${isOpen ? 'open' : ''}`}
        onClick={onTogglePanelOpen}
        title={isOpen ? 'Cerrar panel' : 'Abrir filtros'}
        aria-label="Toggle filter panel"
      >
        {isOpen ? '✕' : '⚙'}
      </button>

      {/* Panel principal */}
      <aside className={`filter-panel ${isOpen ? '' : 'collapsed'}`} aria-label="Panel de filtros">
        {/* Header */}
        <div className="panel-header">
          <span className="panel-icon">🔭</span>
          <h3>Explorar Ideologías</h3>
        </div>

            <button 
              onClick={onOpenTest}
              style={{ 
                width: '100%', 
                padding: '12px', 
                marginBottom: '20px', 
                background: 'linear-gradient(90deg, var(--accent-rose) 0%, var(--accent-violet) 100%)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 'var(--radius-sm)', 
                fontWeight: '700', 
                cursor: 'pointer', 
                boxShadow: '0 4px 15px rgba(244, 63, 94, 0.25)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.85rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(244, 63, 94, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(244, 63, 94, 0.25)';
              }}
            >
              <span>🧠</span> Iniciar Test Conversacional
            </button>

            {/* Buscador */}
            <div className="search-group">
          <label className="search-label" htmlFor="ideology-search">
            Buscar corriente
          </label>
          <input
            id="ideology-search"
            type="text"
            className="search-input"
            placeholder="Ej: libertario, ecosocial..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Slider eje Z */}
        <div className="slider-group">
          <div className="slider-header">
            <span className="slider-label">Filtro Pluralidad (Z ≥)</span>
            <span className="slider-value">{zThreshold.toFixed(1)}</span>
          </div>
          <input
            id="z-threshold-slider"
            type="range"
            className="range-slider"
            min="-1"
            max="1"
            step="0.1"
            value={zThreshold}
            onChange={(e) => onZThresholdChange(parseFloat(e.target.value))}
          />
          <div className="range-labels">
            <span className="range-label-text">Monismo</span>
            <span className="range-label-text">Pluralismo</span>
          </div>
        </div>

        {/* Lista de nodos */}
        <div className="search-group">
          <span className="search-label">
            Nodos ({filtered.length})
          </span>
        </div>

        <div className="ideology-list" role="list">
          {filtered.map((ideology) => {
            const passes = passesZ(ideology);
            const isActive = activeIds.includes(ideology.id);

            return (
              <button
                key={ideology.id}
                role="listitem"
                className={`ideology-item ${isActive ? 'active' : ''} ${!passes ? 'dimmed' : ''}`}
                onClick={() => onToggleNode(ideology.id)}
                title={ideology.description}
                aria-pressed={isActive}
              >
                <span
                  className="ideology-color-dot"
                  style={{ color: ideology.color, background: ideology.color }}
                />
                <span className="ideology-name">{ideology.name}</span>
                {!passes && (
                  <span
                    style={{ fontSize: '9px', color: 'var(--text-muted)', flexShrink: 0 }}
                    title="Filtrado por Pluralidad"
                  >
                    ●
                  </span>
                )}
              </button>
            );
          })}

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', padding: '16px 0' }}>
                Sin resultados
              </div>
            )}
          </div>
      </aside>
    </>
  );
}
