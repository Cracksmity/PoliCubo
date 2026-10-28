/**
 * Toast.jsx
 * Aviso breve (enlace copiado, punto añadido a la comparación…).
 */
import { useStore } from '../store';

export default function Toast() {
  const toast = useStore((s) => s.toast);
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
