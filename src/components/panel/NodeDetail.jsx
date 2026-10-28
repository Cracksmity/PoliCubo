/**
 * NodeDetail.jsx
 * Ficha de un nodo en el panel (clic o toque en el cubo o en la lista).
 * - Corriente: familia, descripción, posición, referentes, afinidad contigo,
 *   corrientes más cercanas y relacionadas
 * - Tu resultado: resumen completo, historial y acciones
 * - Comparación: posición, afinidad contigo y quitarla
 */
import { useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trash2, Users } from 'lucide-react';

import AxisBars from '../shared/AxisBars';
import ShapeIcon from '../shared/ShapeIcon';
import ResultSummary, { NearestList } from '../shared/ResultSummary';
import { useStore } from '../../store';
import { useSceneNodes } from '../../lib/nodes';
import { affinity } from '../../lib/political';
import { FAMILIES } from '../../data/families';
import { IDEOLOGY_BY_ID } from '../../data/ideologies';

function AffinityWithYou({ coords }) {
  const userResult = useStore((s) => s.userResult);
  if (!userResult) return null;
  const value = affinity(userResult.coords, coords);
  return (
    <div className="affinity-you">
      <span>Afinidad contigo</span>
      <strong>{value} %</strong>
      <span className="nearest-bar"><span style={{ width: `${value}%`, background: userResult.color }} /></span>
    </div>
  );
}

export default function NodeDetail({ id }) {
  const nodes = useSceneNodes();
  const select = useStore((s) => s.select);
  const clearSelection = useStore((s) => s.clearSelection);
  const userResult = useStore((s) => s.userResult);
  const history = useStore((s) => s.history);
  const openTest = useStore((s) => s.openTest);
  const clearUserResult = useStore((s) => s.clearUserResult);
  const removeCompare = useStore((s) => s.removeCompare);
  const addComparePoints = useStore((s) => s.addComparePoints);
  const showToast = useStore((s) => s.showToast);

  const node = nodes.find((n) => n.id === id);

  // Si el nodo desaparece (p. ej. se borra el resultado), volver a la lista
  useEffect(() => {
    if (!node) clearSelection();
  }, [node, clearSelection]);

  if (!node) return null;

  const back = (
    <button className="detail-back" onClick={clearSelection}>
      <ArrowLeft size={15} aria-hidden="true" /> Explorar
    </button>
  );

  // ── Tu resultado ──────────────────────────────────────────
  if (node.kind === 'user' && userResult) {
    const previous = history.filter((h) => h.date !== userResult.date);
    return (
      <div className="node-detail">
        {back}
        <div className="detail-kicker">Tu resultado</div>
        <ResultSummary result={userResult} onPickIdeology={select} />

        {previous.length > 0 && (
          <>
            <h4 className="section-title">Resultados anteriores</h4>
            <ul className="history-list">
              {previous.map((h) => (
                <li key={h.date} className="history-item">
                  <span className="history-name">{h.name}</span>
                  <span className="history-date">{new Date(h.date).toLocaleDateString('es-ES')}</span>
                  <button
                    className="btn btn-small btn-ghost"
                    onClick={() => {
                      addComparePoints([{ name: `Yo (${new Date(h.date).toLocaleDateString('es-ES')})`, coords: h.coords }]);
                      showToast('Añadido a la comparación');
                    }}
                  >
                    <Users size={13} aria-hidden="true" /> Comparar
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="result-actions">
          <button className="btn btn-primary" onClick={openTest}>
            <RefreshCw size={16} aria-hidden="true" /> Repetir el test
          </button>
          <button className="link-btn danger" onClick={clearUserResult}>
            <Trash2 size={13} aria-hidden="true" /> Borrar mi resultado de este navegador
          </button>
        </div>
      </div>
    );
  }

  // ── Punto de comparación ──────────────────────────────────
  if (node.kind === 'compare') {
    return (
      <div className="node-detail">
        {back}
        <div className="detail-kicker">Comparación</div>
        <h3 className="detail-title">{node.name}</h3>
        <AffinityWithYou coords={node.coords} />
        <AxisBars coords={node.coords} />
        <h4 className="section-title">Corrientes más cercanas</h4>
        <NearestList coords={node.coords} onPick={select} />
        <div className="result-actions">
          <button className="link-btn danger" onClick={() => removeCompare(node.id)}>
            <Trash2 size={13} aria-hidden="true" /> Quitar de la comparación
          </button>
        </div>
      </div>
    );
  }

  // ── Corriente de referencia ───────────────────────────────
  const family = FAMILIES[node.family];
  const related = (node.connections || [])
    .concat(nodes.filter((n) => n.kind === 'ideology' && n.connections?.includes(node.id)).map((n) => n.id))
    .filter((cid, i, arr) => arr.indexOf(cid) === i && IDEOLOGY_BY_ID[cid]);

  return (
    <div className="node-detail">
      {back}
      <div className="detail-kicker" style={{ color: family?.color }}>
        <ShapeIcon shape={family?.shape} color={family?.color} /> {family?.label}
      </div>
      <h3 className="detail-title">{node.name}</h3>
      {node.author && (
        <p className="author-note">
          <span className="badge badge-author">Propuesta del autor</span> Corriente personal del creador de PoliCubo, no una ideología de referencia.
        </p>
      )}
      <p className="detail-desc">{node.description}</p>

      <AffinityWithYou coords={node.coords} />
      <AxisBars coords={node.coords} />

      {node.thinkers?.length > 0 && (
        <>
          <h4 className="section-title">Referentes</h4>
          <p className="detail-thinkers">{node.thinkers.join(' · ')}</p>
        </>
      )}

      <h4 className="section-title">Corrientes más cercanas</h4>
      <NearestList coords={node.coords} excludeId={node.id} onPick={select} />

      {related.length > 0 && (
        <>
          <h4 className="section-title">Relacionadas</h4>
          <div className="related-chips">
            {related.map((rid) => (
              <button key={rid} className="family-chip" style={{ '--chip-color': IDEOLOGY_BY_ID[rid].color }} onClick={() => select(rid)}>
                <ShapeIcon shape={IDEOLOGY_BY_ID[rid].shape} color={IDEOLOGY_BY_ID[rid].color} />
                {IDEOLOGY_BY_ID[rid].name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
