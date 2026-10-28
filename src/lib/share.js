/**
 * share.js
 * Compartir resultados: enlace con las coordenadas y tarjeta en imagen.
 *
 * Formato del enlace: ?p=Nombre:x,y,z  (varios puntos separados por "|")
 * Quien abre el enlace ve ese punto en su cubo para compararse.
 */
import { AXES, AXIS_KEYS } from '../data/axes';
import { clamp1 } from './political';

const MAX_NAME = 40;

export function encodePoint({ name, coords }) {
  const safeName = (name || 'Resultado').replace(/[|:]/g, ' ').slice(0, MAX_NAME);
  const c = AXIS_KEYS.map((k) => coords[k].toFixed(2)).join(',');
  return `${safeName}:${c}`;
}

export function buildShareUrl(result) {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('p', encodePoint(result));
  return url.toString();
}

/** Lee los puntos compartidos de la URL actual (ignora los mal formados) */
export function parseSharedPoints(search = window.location.search) {
  const param = new URLSearchParams(search).get('p');
  if (!param) return [];
  return param.split('|').flatMap((chunk) => {
    const sep = chunk.lastIndexOf(':');
    if (sep < 0) return [];
    const name = chunk.slice(0, sep).trim().slice(0, MAX_NAME) || 'Resultado compartido';
    const nums = chunk.slice(sep + 1).split(',').map(Number);
    if (nums.length !== 3 || !nums.every(Number.isFinite)) return [];
    const [x, y, z] = nums.map(clamp1);
    return [{ name, coords: { x, y, z } }];
  });
}

/** Quita ?p= de la barra de direcciones sin recargar */
export function clearSharedParam() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('p')) return;
  url.searchParams.delete('p');
  window.history.replaceState(null, '', url.toString());
}

/**
 * Comparte el enlace con la hoja nativa del sistema si existe;
 * si no, lo copia al portapapeles. Devuelve 'shared' | 'copied' | 'failed'.
 */
export async function shareResult(result) {
  const url = buildShareUrl(result);
  const text = `Mi posición en PoliCubo: ${result.name}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: 'PoliCubo', text, url });
      return 'shared';
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled';
      // Si falla, probamos con el portapapeles
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'failed';
  }
}

/**
 * Genera una tarjeta PNG 1200×630 con una captura del cubo y el resultado,
 * y la descarga. El canvas WebGL necesita preserveDrawingBuffer para capturarse.
 */
export async function downloadResultCard(result) {
  const W = 1200;
  const H = 630;
  const card = document.createElement('canvas');
  card.width = W;
  card.height = H;
  const ctx = card.getContext('2d');

  // Fondo
  const bg = ctx.createRadialGradient(W * 0.7, H / 2, 50, W * 0.7, H / 2, W * 0.8);
  bg.addColorStop(0, '#0d1428');
  bg.addColorStop(1, '#050810');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Captura del cubo a la derecha (recorte centrado tipo "cover")
  const scene = document.querySelector('.canvas-container canvas');
  if (scene) {
    try {
      const targetW = 620;
      const targetH = H;
      const scale = Math.max(targetW / scene.width, targetH / scene.height);
      const sw = targetW / scale;
      const sh = targetH / scale;
      const sx = (scene.width - sw) / 2;
      const sy = (scene.height - sh) / 2;
      ctx.drawImage(scene, sx, sy, sw, sh, W - targetW, 0, targetW, targetH);
      const fade = ctx.createLinearGradient(W - targetW, 0, W - targetW + 160, 0);
      fade.addColorStop(0, '#050810');
      fade.addColorStop(1, 'rgba(5, 8, 16, 0)');
      ctx.fillStyle = fade;
      ctx.fillRect(W - targetW, 0, 160, H);
    } catch {
      // Sin captura: la tarjeta sale solo con texto
    }
  }

  // Texto
  ctx.fillStyle = '#7d8aa8';
  ctx.font = '600 22px Inter, system-ui, sans-serif';
  ctx.fillText('MI POSICIÓN EN POLICUBO', 64, 92);

  ctx.fillStyle = result.color || '#22d3ee';
  ctx.font = '700 46px "Space Grotesk", Inter, sans-serif';
  wrapText(ctx, result.name, 64, 152, 560, 54, 3);

  // Barras por eje
  let y = 360;
  for (const key of AXIS_KEYS) {
    const axis = AXES[key];
    const v = result.coords[key];
    ctx.fillStyle = '#e8edf8';
    ctx.font = '600 20px Inter, system-ui, sans-serif';
    ctx.fillText(`${axis.name}: ${axis.label(v)} (${v.toFixed(2)})`, 64, y);
    const barX = 64;
    const barW = 500;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    roundRect(ctx, barX, y + 14, barW, 10, 5);
    ctx.fill();
    ctx.fillStyle = axis.color;
    const px = barX + ((v + 1) / 2) * barW;
    ctx.beginPath();
    ctx.arc(px, y + 19, 10, 0, Math.PI * 2);
    ctx.fill();
    y += 74;
  }

  ctx.fillStyle = '#7d8aa8';
  ctx.font = '500 18px Inter, system-ui, sans-serif';
  ctx.fillText(new URL(window.location.href).host, 64, H - 40);

  const blob = await new Promise((resolve) => card.toBlob(resolve, 'image/png'));
  if (!blob) return false;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'policubo-resultado.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  return true;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = String(text).split(/\s+/);
  let line = '';
  let lines = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      lines++;
      if (lines === maxLines) {
        ctx.fillText(`${line}…`, x, y);
        return;
      }
      ctx.fillText(line, x, y);
      line = words[i];
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
