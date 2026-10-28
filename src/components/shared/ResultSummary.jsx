/**
 * ResultSummary.jsx
 * Resultado del test: nombre, descripción, posición por eje, corrientes más
 * cercanas con % de afinidad, por qué esas coordenadas y cómo se calcularon.
 * Se usa en la pantalla final del test y en la ficha de «Tú».
 */
import { Share2, Download } from 'lucide-react';

import AxisBars from './AxisBars';
import ShapeIcon from './ShapeIcon';
import { useStore } from '../../store';
import { nearestIdeologies } from '../../lib/political';
import { shareResult, downloadResultCard } from '../../lib/share';
import { AXIS_KEYS } from '../../data/axes';

const MODE_LABELS = {
  classic: 'Test clásico',
  guided: 'Test guiado con IA',
  free: 'Test libre con IA',
};

export function NearestList({ coords, excludeId, onPick }) {
  const nearest = nearestIdeologies(coords, 3, excludeId);
  return (
    <ul className="nearest-list">
      {nearest.map(({ ideology, affinity }) => (
        <li key={ideology.id}>
          <button className="nearest-item" onClick={() => onPick(ideology.id)}>
            <ShapeIcon shape={ideology.shape} color={ideology.color} />
            <span className="nearest-name">{ideology.name}</span>
            <span className="nearest-affinity">{affinity} %</span>
            <span className="nearest-bar"><span style={{ width: `${affinity}%`, background: ideology.color }} /></span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function ScoreChips({ score }) {
  if (!score) return <span className="score-chip muted">sin puntuar</span>;
  return AXIS_KEYS.filter((k) => typeof score[k] === 'number').map((k) => (
    <span key={k} className={`score-chip badge-${k}`}>
      {k.toUpperCase()} {score[k] > 0 ? '+' : ''}{score[k].toFixed(2)}
    </span>
  ));
}

export default function ResultSummary({ result, onPickIdeology }) {
  const showToast = useStore((s) => s.showToast);

  const handleShare = async () => {
    const outcome = await shareResult(result);
    if (outcome === 'copied') showToast('Enlace copiado: quien lo abra verá tu punto en su cubo');
    else if (outcome === 'failed') showToast('No se pudo compartir el enlace');
  };

  const handleDownload = async () => {
    const ok = await downloadResultCard(result);
    if (!ok) showToast('No se pudo generar la imagen');
  };

  return (
    <div className="result-summary">
      <div className="result-meta">
        {MODE_LABELS[result.mode] || 'Resultado'}
        {result.date && ` · ${new Date(result.date).toLocaleDateString('es-ES')}`}
      </div>
      <h3 className="result-name" style={{ color: result.color }}>{result.name}</h3>
      {result.description && <p className="result-desc">{result.description}</p>}

      <AxisBars coords={result.coords} />

      <h4 className="section-title">Corrientes más cercanas</h4>
      <NearestList coords={result.coords} onPick={onPickIdeology} />

      {result.reasoning && (
        <>
          <h4 className="section-title">Por qué estas coordenadas</h4>
          <p className="result-reasoning">{result.reasoning}</p>
        </>
      )}

      {result.answers?.length > 0 && (
        <details className="result-breakdown">
          <summary>Cómo se calculó ({result.answers.length} respuestas)</summary>
          <p className="breakdown-note">
            {result.mode === 'classic'
              ? 'Cada afirmación suma o resta en su eje según tu grado de acuerdo; el resultado es la media por eje.'
              : 'La IA puntúa cada respuesta en los ejes que toca, con una confianza de 0 a 1. Tu posición es la media ponderada por eje, calculada en la app.'}
          </p>
          <ol className="breakdown-list">
            {result.answers.map((a, i) => (
              <li key={i}>
                {a.question && <div className="breakdown-q">{a.question}</div>}
                <div className="breakdown-a">«{a.answer}»</div>
                <div className="breakdown-scores"><ScoreChips score={a.score} /></div>
              </li>
            ))}
          </ol>
        </details>
      )}

      <div className="result-actions">
        <button className="btn btn-secondary" onClick={handleShare}>
          <Share2 size={16} aria-hidden="true" /> Compartir enlace
        </button>
        <button className="btn btn-secondary" onClick={handleDownload}>
          <Download size={16} aria-hidden="true" /> Descargar imagen
        </button>
      </div>
    </div>
  );
}
