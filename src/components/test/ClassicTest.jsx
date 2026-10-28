/**
 * ClassicTest.jsx
 * Test clásico sin IA: una afirmación cada vez, escala de acuerdo de 5 puntos.
 * Teclas 1–5 para responder y ← para volver. Puntuación determinista
 * (lib/political.js → scoreClassic).
 */
import { useEffect, useState } from 'react';
import { ChevronLeft, SkipForward } from 'lucide-react';

import { CLASSIC_QUESTIONS, LIKERT_OPTIONS } from '../../data/classicTest';
import { AXES } from '../../data/axes';
import { scoreClassic, nearestIdeologies, describePosition } from '../../lib/political';

const TOTAL = CLASSIC_QUESTIONS.length;

function buildResult(answers) {
  const { x, y, z } = scoreClassic(answers);
  const coords = { x, y, z };
  const [nearest] = nearestIdeologies(coords, 1);
  return {
    mode: 'classic',
    date: new Date().toISOString(),
    name: `Afín a ${nearest.ideology.name}`,
    description: `${describePosition(coords)}. La corriente de referencia más cercana a tus respuestas es ${nearest.ideology.name}, con un ${nearest.affinity} % de afinidad.`,
    color: nearest.ideology.color,
    coords,
    reasoning: null,
    answers: CLASSIC_QUESTIONS.filter((q) => typeof answers[q.id] === 'number').map((q) => ({
      question: q.text,
      answer: LIKERT_OPTIONS.find((o) => o.value === answers[q.id])?.label,
      score: { [q.axis]: Math.round(answers[q.id] * q.dir * 100) / 100 },
    })),
  };
}

export default function ClassicTest({ active, onProgress, onFinish, onStep }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const q = CLASSIC_QUESTIONS[index];

  useEffect(() => {
    onStep({ current: index + 1, total: TOTAL });
  }, [index, onStep]);

  const answer = (value) => {
    const next = { ...answers };
    if (value === null) delete next[q.id];
    else next[q.id] = value;
    setAnswers(next);
    if (Object.keys(next).length) {
      const { x, y, z } = scoreClassic(next);
      onProgress({ x, y, z });
    }
    if (index + 1 < TOTAL) setIndex(index + 1);
    else onFinish(buildResult(next));
  };

  // Atajos de teclado: 1–5 responden, ← vuelve atrás
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return;
      const n = Number(e.key);
      if (n >= 1 && n <= LIKERT_OPTIONS.length) {
        e.preventDefault();
        answer(LIKERT_OPTIONS[n - 1].value);
      } else if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        setIndex(index - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const axis = AXES[q.axis];

  return (
    <div className="classic-test">
      <div className="classic-axis" style={{ color: axis.color }}>
        Eje {axis.name}
      </div>
      <p className="classic-statement" aria-live="polite">{q.text}</p>

      <div className="likert" role="group" aria-label="Tu grado de acuerdo">
        {LIKERT_OPTIONS.map((o, i) => (
          <button
            key={o.value}
            className={`likert-btn ${answers[q.id] === o.value ? 'selected' : ''}`}
            onClick={() => answer(o.value)}
          >
            <span className="likert-key" aria-hidden="true">{i + 1}</span>
            {o.label}
          </button>
        ))}
      </div>

      <div className="classic-nav">
        <button className="link-btn" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          <ChevronLeft size={15} aria-hidden="true" /> Anterior
        </button>
        <button className="link-btn" onClick={() => answer(null)}>
          Saltar <SkipForward size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
