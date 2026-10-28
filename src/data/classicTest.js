/**
 * classicTest.js
 * Test clásico sin IA: afirmaciones fijas con escala de acuerdo.
 *
 * `axis`: eje que mide la afirmación.
 * `dir`:  +1 si estar de acuerdo empuja hacia el extremo positivo del eje
 *         (Derecha / Autoritario / Pluralismo), -1 si empuja al negativo.
 * Las direcciones se alternan para que contestar siempre "de acuerdo" no sesgue el resultado.
 */
export const CLASSIC_QUESTIONS = [
  { id: 'x1', axis: 'x', dir:  1, text: 'El mercado libre asigna los recursos mejor que la planificación del Estado.' },
  { id: 'y1', axis: 'y', dir:  1, text: 'Un gobierno fuerte es necesario para mantener el orden en la sociedad.' },
  { id: 'z1', axis: 'z', dir:  1, text: 'Una sociedad con muchas culturas y religiones distintas es una sociedad más rica.' },
  { id: 'x2', axis: 'x', dir: -1, text: 'La sanidad y la educación deberían ser públicas y gratuitas para todos.' },
  { id: 'y2', axis: 'y', dir: -1, text: 'Cada persona debería poder decidir sobre su propio cuerpo sin interferencia del Estado.' },
  { id: 'z2', axis: 'z', dir: -1, text: 'Los inmigrantes deberían adoptar plenamente la cultura del país que los acoge.' },
  { id: 'x3', axis: 'x', dir:  1, text: 'Bajar los impuestos a las empresas acaba beneficiando a toda la sociedad.' },
  { id: 'y3', axis: 'y', dir:  1, text: 'Es aceptable limitar algunas libertades si con ello aumenta la seguridad.' },
  { id: 'z3', axis: 'z', dir:  1, text: 'Todas las orientaciones sexuales y formas de familia merecen el mismo reconocimiento legal.' },
  { id: 'x4', axis: 'x', dir: -1, text: 'Las grandes fortunas deberían pagar impuestos mucho más altos.' },
  { id: 'y4', axis: 'y', dir: -1, text: 'Las drogas deberían ser legales para los adultos.' },
  { id: 'z4', axis: 'z', dir: -1, text: 'Una nación necesita una identidad cultural y religiosa común para mantenerse unida.' },
  { id: 'x5', axis: 'x', dir:  1, text: 'La propiedad privada de los medios de producción es legítima y necesaria.' },
  { id: 'y5', axis: 'y', dir:  1, text: 'La obediencia a la autoridad es una virtud importante.' },
  { id: 'z5', axis: 'z', dir:  1, text: 'Las minorías deberían tener una protección especial frente a la discriminación.' },
  { id: 'x6', axis: 'x', dir: -1, text: 'Los trabajadores deberían controlar las empresas en las que trabajan.' },
  { id: 'y6', axis: 'y', dir: -1, text: 'El Estado debería tener el menor poder posible sobre la vida de las personas.' },
  { id: 'z6', axis: 'z', dir: -1, text: 'Existe una única forma correcta de vivir que la sociedad debería promover.' },
  { id: 'x7', axis: 'x', dir:  1, text: 'El Estado no debería fijar precios ni salarios mínimos.' },
  { id: 'y7', axis: 'y', dir:  1, text: 'La vigilancia masiva está justificada para prevenir el terrorismo.' },
  { id: 'z7', axis: 'z', dir:  1, text: 'La cooperación internacional es más importante que la soberanía nacional.' },
  { id: 'x8', axis: 'x', dir: -1, text: 'Los sectores estratégicos como la energía, el agua o el transporte deberían ser públicos.' },
  { id: 'y8', axis: 'y', dir: -1, text: 'La desobediencia civil está justificada frente a leyes injustas.' },
  { id: 'z8', axis: 'z', dir: -1, text: 'Las fronteras deberían cerrarse para proteger la identidad del país.' },
];

/** Opciones de respuesta: valor de acuerdo en [-1, 1] */
export const LIKERT_OPTIONS = [
  { value: -1,   label: 'Muy en desacuerdo' },
  { value: -0.5, label: 'En desacuerdo' },
  { value: 0,    label: 'Neutral' },
  { value: 0.5,  label: 'De acuerdo' },
  { value: 1,    label: 'Muy de acuerdo' },
];
