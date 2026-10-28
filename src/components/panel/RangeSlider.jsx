/**
 * RangeSlider.jsx
 * Slider de rango con dos asas (mínimo y máximo) para filtrar un eje.
 * Son dos <input type="range"> superpuestos: accesibles con teclado
 * y lectores de pantalla sin librerías.
 */
const STEP = 0.1;

export default function RangeSlider({ axis, value, onChange }) {
  const [min, max] = value;
  const left = ((min + 1) / 2) * 100;
  const right = ((max + 1) / 2) * 100;

  return (
    <div className="range-filter">
      <div className="range-filter-head">
        <span className="slider-label" style={{ color: axis.color }}>{axis.name}</span>
        <span className="slider-value">
          {min.toFixed(1)} – {max.toFixed(1)}
        </span>
      </div>
      <div className="dual-range" style={{ '--range-color': axis.color }}>
        <div className="dual-range-track" />
        <div className="dual-range-fill" style={{ left: `${left}%`, right: `${100 - right}%` }} />
        <input
          type="range"
          min="-1"
          max="1"
          step={STEP}
          value={min}
          aria-label={`${axis.name}: mínimo`}
          onChange={(e) => onChange([Math.min(parseFloat(e.target.value), max), max])}
        />
        <input
          type="range"
          min="-1"
          max="1"
          step={STEP}
          value={max}
          aria-label={`${axis.name}: máximo`}
          onChange={(e) => onChange([min, Math.max(parseFloat(e.target.value), min)])}
        />
      </div>
      <div className="range-labels">
        <span className="range-label-text">{axis.min}</span>
        <span className="range-label-text">{axis.max}</span>
      </div>
    </div>
  );
}
