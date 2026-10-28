/**
 * ExplorePanel.jsx
 * Vista principal del panel: tu resultado, buscador, familias, filtros por
 * los tres ejes, puntos de comparación y la lista de corrientes.
 */
import { Search, Share2, X, Users, ChevronRight } from 'lucide-react';

import RangeSlider from './RangeSlider';
import ShapeIcon from '../shared/ShapeIcon';
import { useStore, DEFAULT_RANGES } from '../../store';
import { IDEOLOGIES, matchesSearch } from '../../data/ideologies';
import { FAMILIES, FAMILY_IDS } from '../../data/families';
import { AXES, AXIS_KEYS } from '../../data/axes';
import { affinity } from '../../lib/political';
import { shareResult } from '../../lib/share';
import { passesFilters, useFilters, USER_NODE_ID } from '../../lib/nodes';

export default function ExplorePanel() {
  const filters = useFilters();
  const { search, ranges, families } = filters;
  const setSearch = useStore((s) => s.setSearch);
  const setRange = useStore((s) => s.setRange);
  const toggleFamily = useStore((s) => s.toggleFamily);
  const resetFilters = useStore((s) => s.resetFilters);
  const select = useStore((s) => s.select);
  const userResult = useStore((s) => s.userResult);
  const compare = useStore((s) => s.compare);
  const removeCompare = useStore((s) => s.removeCompare);
  const showToast = useStore((s) => s.showToast);

  // La lista se filtra por búsqueda; el resto de filtros solo atenúa (igual que en el cubo)
  const listed = IDEOLOGIES.filter((i) => matchesSearch(i, search));
  const filtersActive =
    search || families.length || AXIS_KEYS.some((k) => ranges[k][0] !== DEFAULT_RANGES[k][0] || ranges[k][1] !== DEFAULT_RANGES[k][1]);

  const handleShare = async () => {
    const outcome = await shareResult(userResult);
    if (outcome === 'copied') showToast('Enlace copiado');
    else if (outcome === 'failed') showToast('No se pudo compartir el enlace');
  };

  return (
    <div className="explore-panel">
      {/* Tu resultado */}
      {userResult && (
        <div className="you-card">
          <div className="you-card-head">
            <span className="you-dot" style={{ background: userResult.color }} />
            <div className="you-card-text">
              <span className="you-kicker">Tu resultado</span>
              <span className="you-name">{userResult.name}</span>
            </div>
          </div>
          <div className="you-card-actions">
            <button className="btn btn-small btn-secondary" onClick={() => select(USER_NODE_ID)}>
              Ver ficha <ChevronRight size={14} aria-hidden="true" />
            </button>
            <button className="btn btn-small btn-ghost" onClick={handleShare} aria-label="Compartir tu resultado">
              <Share2 size={14} aria-hidden="true" /> Compartir
            </button>
          </div>
        </div>
      )}

      {/* Buscador */}
      <div className="search-group">
        <label className="search-label" htmlFor="ideology-search">Buscar corriente</label>
        <div className="search-wrap">
          <Search size={15} className="search-icon" aria-hidden="true" />
          <input
            id="ideology-search"
            type="search"
            className="search-input"
            placeholder="Ej: liberal, ecología, anarquismo…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Familias */}
      <div className="search-group">
        <span className="search-label">Familias</span>
        <div className="family-chips">
          {FAMILY_IDS.map((id) => {
            const active = families.includes(id);
            return (
              <button
                key={id}
                className={`family-chip ${active ? 'active' : ''}`}
                style={{ '--chip-color': FAMILIES[id].color }}
                onClick={() => toggleFamily(id)}
                aria-pressed={active}
              >
                <ShapeIcon shape={FAMILIES[id].shape} color={FAMILIES[id].color} />
                {FAMILIES[id].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtros por eje */}
      <div className="search-group">
        <span className="search-label">Filtrar por eje</span>
        {AXIS_KEYS.map((k) => (
          <RangeSlider key={k} axis={AXES[k]} value={ranges[k]} onChange={(r) => setRange(k, r)} />
        ))}
        {filtersActive && (
          <button className="link-btn" onClick={resetFilters}>Quitar filtros</button>
        )}
      </div>

      {/* Comparación */}
      {compare.length > 0 && (
        <div className="search-group">
          <span className="search-label"><Users size={13} aria-hidden="true" /> Comparación ({compare.length})</span>
          <ul className="compare-list">
            {compare.map((p) => (
              <li key={p.id} className="compare-item">
                <button className="compare-open" onClick={() => select(p.id)}>
                  <span className="compare-name">{p.name}</span>
                  {userResult && (
                    <span className="compare-affinity">{affinity(userResult.coords, p.coords)} % contigo</span>
                  )}
                </button>
                <button className="icon-btn icon-btn-small" onClick={() => removeCompare(p.id)} aria-label={`Quitar ${p.name} de la comparación`}>
                  <X size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lista de nodos */}
      <div className="search-group">
        <span className="search-label">Corrientes ({listed.length})</span>
        <div className="ideology-list" role="list">
          {listed.map((ideology) => {
            const passes = passesFilters(ideology, filters);
            return (
              <button
                key={ideology.id}
                role="listitem"
                className={`ideology-item ${!passes ? 'dimmed' : ''}`}
                onClick={() => select(ideology.id)}
                title={ideology.description}
              >
                <ShapeIcon shape={ideology.shape} color={ideology.color} />
                <span className="ideology-name">{ideology.name}</span>
                {ideology.author && <span className="badge badge-author">autor</span>}
              </button>
            );
          })}
          {listed.length === 0 && <div className="empty-note">Sin resultados</div>}
        </div>
      </div>
    </div>
  );
}
