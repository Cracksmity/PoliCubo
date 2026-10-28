/**
 * TestModal.jsx
 * Test de PoliCubo: elección de modo → test → pantalla de resultado.
 *
 * - En pantallas anchas se acopla a la izquierda para que se vea cómo se mueve
 *   tu punto provisional en el cubo; en móvil ocupa toda la pantalla y muestra
 *   la posición provisional como barras.
 * - Se mantiene montado aunque se cierre: al volver, el test sigue donde estaba.
 */
import { useCallback, useRef, useState } from 'react';
import { ArrowLeft, Bot, X, Eye, RefreshCw } from 'lucide-react';

import ModeSelect from './ModeSelect';
import ClassicTest from './ClassicTest';
import ChatTest from './ChatTest';
import AxisBars from '../shared/AxisBars';
import ResultSummary from '../shared/ResultSummary';
import { useStore } from '../../store';
import { useDialog } from '../../lib/useDialog';
import { USER_NODE_ID } from '../../lib/nodes';
import './test.css';

export default function TestModal({ open }) {
  const closeTest = useStore((s) => s.closeTest);
  const setLiveCoords = useStore((s) => s.setLiveCoords);
  const setUserResult = useStore((s) => s.setUserResult);
  const select = useStore((s) => s.select);
  const liveCoords = useStore((s) => s.liveCoords);

  const [mode, setMode] = useState(null); // 'classic' | 'guided' | 'free'
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(null); // { current, total }
  const [session, setSession] = useState(0); // cambia para reiniciar el test desde cero

  const ref = useRef(null);
  useDialog(ref, closeTest, open);

  /** Vuelve a la selección de modo, descartando el test en curso */
  const restart = () => {
    setMode(null);
    setResult(null);
    setProgress(null);
    setLiveCoords(null);
    setSession((s) => s + 1);
  };

  const handleFinish = (res) => {
    setUserResult(res);
    setResult(res);
    setProgress(null);
  };

  const handleStep = useCallback((p) => setProgress(p), []);
  const handleProgress = useCallback((coords) => setLiveCoords(coords), [setLiveCoords]);

  const viewInCube = () => {
    closeTest();
    select(USER_NODE_ID);
  };

  const pickIdeology = (id) => {
    closeTest();
    select(id);
  };

  const running = mode && !result;

  return (
    <div className="test-overlay" style={{ display: open ? undefined : 'none' }}>
      <div className="test-modal" ref={ref} role="dialog" aria-modal="true" aria-labelledby="test-title">
        {/* Header */}
        <div className="test-header">
          {running && (
            <button className="icon-btn" onClick={restart} title="Cambiar de modo" aria-label="Cambiar de modo">
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
          )}
          <h2 id="test-title" className="test-title">
            <Bot size={22} aria-hidden="true" /> {result ? 'Tu resultado' : 'Test político'}
          </h2>
          {running && progress && (
            <span className="test-progress-text">
              Pregunta {progress.current} de {progress.total}
            </span>
          )}
          <button className="icon-btn test-close" onClick={closeTest} title="Cerrar (el test se guarda)" aria-label="Cerrar test">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {running && progress && (
          <div
            className="test-progress"
            role="progressbar"
            aria-label="Progreso del test"
            aria-valuemin={0}
            aria-valuemax={progress.total}
            aria-valuenow={progress.current}
          >
            <span style={{ width: `${(progress.current / progress.total) * 100}%` }} />
          </div>
        )}

        {/* Posición provisional (en pantallas anchas además se ve moverse en el cubo) */}
        {running && liveCoords && (
          <div className="test-live">
            <span className="test-live-label">Tu posición provisional</span>
            <AxisBars coords={liveCoords} compact />
          </div>
        )}

        <div className="test-body">
          {!mode && <ModeSelect onSelect={setMode} />}

          {running && mode === 'classic' && (
            <ClassicTest
              key={session}
              active={open}
              onProgress={handleProgress}
              onFinish={handleFinish}
              onStep={handleStep}
            />
          )}

          {running && (mode === 'guided' || mode === 'free') && (
            <ChatTest
              key={`${session}-${mode}`}
              mode={mode}
              onProgress={handleProgress}
              onFinish={handleFinish}
              onStep={handleStep}
            />
          )}

          {result && (
            <div className="test-result">
              <ResultSummary result={result} onPickIdeology={pickIdeology} />
              <div className="result-actions">
                <button className="btn btn-primary" onClick={viewInCube} data-autofocus>
                  <Eye size={16} aria-hidden="true" /> Ver mi posición en el cubo
                </button>
                <button className="btn btn-secondary" onClick={restart}>
                  <RefreshCw size={16} aria-hidden="true" /> Repetir test
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
