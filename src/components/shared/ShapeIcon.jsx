/**
 * ShapeIcon.jsx
 * Icono 2D de la forma de cada familia, el mismo símbolo que su nodo en el cubo.
 * Sirve de leyenda y de pista que no depende del color.
 */
import { Circle, Square, Diamond, Triangle, Hexagon, Disc, Pill, Cone, Infinity as InfinityIcon } from 'lucide-react';

const ICONS = {
  sphere: Circle,
  box: Square,
  octahedron: Diamond,
  tetrahedron: Triangle,
  icosahedron: Hexagon,
  cylinder: Disc,
  capsule: Pill,
  cone: Cone,
  torusKnot: InfinityIcon,
};

export default function ShapeIcon({ shape = 'sphere', color, size = 12, className = '' }) {
  const Icon = ICONS[shape] || Circle;
  return (
    <Icon
      size={size}
      color={color}
      fill={color}
      fillOpacity={0.35}
      strokeWidth={2.5}
      className={`shape-icon ${className}`}
      aria-hidden="true"
    />
  );
}
