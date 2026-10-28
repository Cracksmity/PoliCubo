/**
 * ModeSelect.jsx
 * Elección del modo de test.
 */
import { ListChecks, Compass, PenLine } from 'lucide-react';

const MODES = [
  {
    id: 'classic',
    Icon: ListChecks,
    title: 'Clásico',
    tag: 'Rápido · sin IA',
    text: '24 afirmaciones con las que estás más o menos de acuerdo. Unos 3 minutos y resultado inmediato.',
    accent: '#a78bfa',
  },
  {
    id: 'guided',
    Icon: Compass,
    title: 'Guiado',
    tag: 'Recomendado · con IA',
    text: 'Preguntas sobre casos cotidianos con opciones de respuesta rápidas.',
    accent: '#22d3ee',
  },
  {
    id: 'free',
    Icon: PenLine,
    title: 'Libre',
    tag: 'Para expertos · con IA',
    text: 'Preguntas abiertas donde tú redactas tus propios argumentos. También puedes pegar un manifiesto.',
    accent: '#f43f5e',
  },
];

export default function ModeSelect({ onSelect }) {
  return (
    <div className="mode-select">
      <h3 className="mode-title">¿Cómo prefieres hacer el test?</h3>
      <p className="mode-lead">
        En los tres modos verás cómo se mueve tu punto en el cubo mientras respondes, y al final podrás ver
        exactamente cómo se ha calculado.
      </p>
      <div className="mode-cards">
        {MODES.map(({ id, Icon, title, tag, text, accent }, i) => (
          <button
            key={id}
            className="mode-card"
            style={{ '--mode-accent': accent }}
            onClick={() => onSelect(id)}
            data-autofocus={i === 0 ? true : undefined}
          >
            <Icon size={34} className="mode-icon" aria-hidden="true" />
            <span className="mode-card-title">{title}</span>
            <span className="mode-card-tag">{tag}</span>
            <span className="mode-card-text">{text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
