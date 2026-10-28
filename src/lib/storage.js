/**
 * storage.js
 * Acceso seguro a localStorage: puede no existir o lanzar errores
 * (modo privado, cuota llena, cookies bloqueadas). La app funciona igual sin él.
 */
export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Sin persistencia: no es crítico
  }
}
