/**
 * store.js
 * Estado global de PoliCubo (zustand). Sustituye a los eventos de `window`
 * (addUserNode, resetCamera) y al estado repartido por App.
 *
 * Se persiste en localStorage: el resultado del usuario, su historial,
 * los puntos de comparación y si ya vio la bienvenida.
 */
import { create } from 'zustand';
import { loadJSON, saveJSON } from './lib/storage';

const KEYS = {
  result: 'policubo:result',
  history: 'policubo:history',
  compare: 'policubo:compare',
  welcome: 'policubo:welcomeSeen',
};

const MAX_HISTORY = 10;
const MAX_COMPARE = 12;

export const MOBILE_QUERY = '(max-width: 767px)';
const isMobileNow = () => window.matchMedia(MOBILE_QUERY).matches;

export const DEFAULT_RANGES = { x: [-1, 1], y: [-1, 1], z: [-1, 1] };

let toastTimer = null;

export const useStore = create((set, get) => ({
  // ── Exploración ───────────────────────────────────────────
  search: '',
  ranges: DEFAULT_RANGES,
  families: [],          // familias activas; vacío = todas
  selectedId: null,      // nodo con la ficha abierta
  hoveredId: null,
  hoverPos: null,        // posición en pantalla del tooltip

  // ── Interfaz ──────────────────────────────────────────────
  isMobile: isMobileNow(),
  panelOpen: !isMobileNow(),          // en móvil el panel es una hoja: empieza cerrada
  welcomeOpen: !loadJSON(KEYS.welcome, false),
  isTesting: false,
  toast: null,

  // ── Cámara ────────────────────────────────────────────────
  // { type: 'reset' } | { type: 'view', view: 'iso'|'xy'|'xz'|'yz' }; `nonce` fuerza repetir la misma orden
  cameraCommand: null,
  activeView: 'iso',

  // ── Test y resultados ─────────────────────────────────────
  liveCoords: null,                   // posición provisional mientras se hace el test
  userResult: loadJSON(KEYS.result, null),
  history: loadJSON(KEYS.history, []),
  compare: loadJSON(KEYS.compare, []),

  // ── Acciones: exploración ─────────────────────────────────
  setSearch: (search) => set({ search }),
  setRange: (axis, range) => set((s) => ({ ranges: { ...s.ranges, [axis]: range } })),
  toggleFamily: (id) =>
    set((s) => ({
      families: s.families.includes(id) ? s.families.filter((f) => f !== id) : [...s.families, id],
    })),
  resetFilters: () => set({ search: '', ranges: DEFAULT_RANGES, families: [] }),

  select: (id) => {
    if (!id || id === get().selectedId) {
      set({ selectedId: null });
      return;
    }
    // La ficha vive en el panel: se abre al seleccionar
    set({ selectedId: id, panelOpen: true, hoveredId: null, hoverPos: null });
  },
  clearSelection: () => set({ selectedId: null }),

  setHover: (id, pos) => set({ hoveredId: id, hoverPos: pos }),
  clearHover: () => set({ hoveredId: null, hoverPos: null }),

  // ── Acciones: interfaz ────────────────────────────────────
  setIsMobile: (isMobile) => set({ isMobile }),
  // Cerrar el panel también cierra la ficha abierta
  setPanelOpen: (panelOpen) => set(panelOpen ? { panelOpen } : { panelOpen, selectedId: null }),
  togglePanel: () => get().setPanelOpen(!get().panelOpen),

  openWelcome: () => set({ welcomeOpen: true }),
  closeWelcome: () => {
    saveJSON(KEYS.welcome, true);
    set({ welcomeOpen: false });
  },

  openTest: () => {
    saveJSON(KEYS.welcome, true);
    set({ isTesting: true, welcomeOpen: false, hoveredId: null, hoverPos: null });
  },
  // El test en curso se conserva al cerrar: al volver a abrirlo sigue donde estaba
  closeTest: () => set({ isTesting: false }),

  showToast: (message) => {
    clearTimeout(toastTimer);
    set({ toast: message });
    toastTimer = setTimeout(() => set({ toast: null }), 3500);
  },

  // ── Acciones: cámara ──────────────────────────────────────
  resetCamera: () => set({ cameraCommand: { type: 'reset', nonce: Date.now() }, activeView: 'iso', selectedId: null }),
  setView: (view) => set({ cameraCommand: { type: 'view', view, nonce: Date.now() }, activeView: view }),

  // ── Acciones: test y resultados ───────────────────────────
  setLiveCoords: (liveCoords) => set({ liveCoords }),

  /** Guarda el resultado del test, lo añade al historial y lo selecciona */
  setUserResult: (result) => {
    const history = [result, ...get().history.filter((h) => h.date !== result.date)].slice(0, MAX_HISTORY);
    saveJSON(KEYS.result, result);
    saveJSON(KEYS.history, history);
    set({ userResult: result, history, liveCoords: null });
  },
  clearUserResult: () => {
    saveJSON(KEYS.result, null);
    set({ userResult: null, selectedId: get().selectedId === 'user-node' ? null : get().selectedId });
  },

  /** Añade puntos a la comparación (evita duplicados por nombre + posición) */
  addComparePoints: (points) => {
    const existing = get().compare;
    const key = (p) => `${p.name}|${p.coords.x}|${p.coords.y}|${p.coords.z}`;
    const seen = new Set(existing.map(key));
    const added = points
      .filter((p) => !seen.has(key(p)))
      .map((p, i) => ({ ...p, id: `compare-${Date.now()}-${i}` }));
    const compare = [...existing, ...added].slice(-MAX_COMPARE);
    saveJSON(KEYS.compare, compare);
    set({ compare });
    return added;
  },
  removeCompare: (id) => {
    const compare = get().compare.filter((p) => p.id !== id);
    saveJSON(KEYS.compare, compare);
    set({ compare, selectedId: get().selectedId === id ? null : get().selectedId });
  },
}));
