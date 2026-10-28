/**
 * ideologies.js
 * Corrientes ideológicas de PoliCubo.
 *
 * Coordenadas en el rango [-1, 1] (ver axes.js):
 *   X: Izquierda ↔ Derecha · Y: Libertario ↔ Autoritario · Z: Monismo ↔ Pluralismo
 *
 * Cada corriente pertenece a una familia (families.js), de la que toma el color.
 * `connections` enlaza corrientes con parentesco intelectual o histórico real
 * (basta con declarar cada enlace en uno de los dos extremos).
 * `thinkers` son referentes para profundizar, no una lista exhaustiva.
 */
import { FAMILIES } from './families';

const RAW_IDEOLOGIES = [
  // ── Socialismo y comunismo ───────────────────────────────────────────────
  {
    id: 'marx-len',
    name: 'Marxismo-leninismo',
    family: 'socialismo',
    coords: { x: -0.9, y: 0.8, z: -0.35 },
    description: 'Partido de vanguardia, economía planificada y propiedad estatal de los medios de producción como transición al comunismo.',
    thinkers: ['Karl Marx', 'Vladímir Lenin'],
    connections: ['maoismo', 'trotskismo', 'cap-estado'],
  },
  {
    id: 'maoismo',
    name: 'Maoísmo',
    family: 'socialismo',
    coords: { x: -0.92, y: 0.85, z: -0.55 },
    description: 'Variante del marxismo-leninismo centrada en el campesinado, la guerra popular prolongada y la revolución cultural.',
    thinkers: ['Mao Zedong'],
    connections: [],
  },
  {
    id: 'trotskismo',
    name: 'Trotskismo',
    family: 'socialismo',
    coords: { x: -0.9, y: 0.45, z: 0.05 },
    description: 'Revolución permanente e internacionalismo obrero, con una crítica frontal a la burocracia estalinista.',
    thinkers: ['León Trotski'],
    connections: ['consejismo'],
  },
  {
    id: 'consejismo',
    name: 'Comunismo de consejos',
    family: 'socialismo',
    coords: { x: -0.88, y: -0.45, z: 0.3 },
    description: 'El poder debe residir en consejos obreros democráticos, no en un partido ni en el Estado.',
    thinkers: ['Anton Pannekoek', 'Rosa Luxemburgo'],
    connections: ['anarco-com'],
  },
  {
    id: 'soc-dem',
    name: 'Socialismo democrático',
    family: 'socialismo',
    coords: { x: -0.65, y: 0.05, z: 0.55 },
    description: 'Transformación socialista de la economía por vías democráticas, manteniendo amplias libertades civiles.',
    thinkers: ['Michael Harrington', 'Salvador Allende'],
    connections: ['soc-plural', 'soc-mercado', 'pop-izq'],
  },
  {
    id: 'soc-mercado',
    name: 'Socialismo de mercado',
    family: 'socialismo',
    coords: { x: -0.5, y: -0.05, z: 0.4 },
    description: 'Empresas de propiedad social o cooperativa que compiten entre sí en un mercado.',
    thinkers: ['Oskar Lange', 'John Roemer'],
    connections: ['mutualismo'],
  },
  {
    id: 'teo-lib',
    name: 'Teología de la liberación',
    family: 'socialismo',
    coords: { x: -0.68, y: 0.0, z: 0.3 },
    description: 'Corriente cristiana que lee el Evangelio desde la opción preferencial por los pobres y la justicia social.',
    thinkers: ['Gustavo Gutiérrez', 'Leonardo Boff'],
    connections: ['soc-dem', 'dem-crist'],
  },
  {
    id: 'pop-izq',
    name: 'Populismo de izquierda',
    family: 'socialismo',
    coords: { x: -0.55, y: 0.35, z: 0.05 },
    description: 'Construye un «pueblo» frente a las élites económicas, con un Estado fuerte y redistribución.',
    thinkers: ['Ernesto Laclau', 'Chantal Mouffe'],
    connections: [],
  },

  // ── Anarquismo ───────────────────────────────────────────────────────────
  {
    id: 'anarco-com',
    name: 'Anarcocomunismo',
    family: 'anarquismo',
    coords: { x: -0.88, y: -0.82, z: 0.65 },
    description: 'Abolición del Estado y del capital. Autogestión comunitaria con énfasis en identidades diversas y redes horizontales.',
    thinkers: ['Piotr Kropotkin', 'Errico Malatesta'],
    connections: ['anarcosind', 'ecosoc-lib'],
  },
  {
    id: 'anarcosind',
    name: 'Anarcosindicalismo',
    family: 'anarquismo',
    coords: { x: -0.8, y: -0.72, z: 0.5 },
    description: 'Los sindicatos como herramienta para abolir el capitalismo y el Estado mediante la acción directa y la huelga general.',
    thinkers: ['Rudolf Rocker', 'Federica Montseny'],
    connections: [],
  },
  {
    id: 'mutualismo',
    name: 'Mutualismo',
    family: 'anarquismo',
    coords: { x: -0.35, y: -0.8, z: 0.4 },
    description: 'Mercado de productores libres, crédito mutuo y una propiedad basada en el uso y no en la renta.',
    thinkers: ['Pierre-Joseph Proudhon'],
    connections: ['anarco-com', 'lib-izq', 'agorismo'],
  },
  {
    id: 'ego-anarch',
    name: 'Anarquismo egoísta (Stirner)',
    family: 'anarquismo',
    coords: { x: -0.75, y: -0.95, z: -0.85 },
    description: 'Rechazo absoluto del Estado, el capitalismo y todo «fantasma» moral o social (ideologías, religión). Máximo individualismo monista centrado en el Yo.',
    thinkers: ['Max Stirner'],
    connections: ['anarco-com', 'ancap', 'salamanca-lib'],
  },
  {
    id: 'anarcoprim',
    name: 'Anarcoprimitivismo',
    family: 'anarquismo',
    coords: { x: -0.45, y: -0.88, z: -0.2 },
    description: 'Rechaza la civilización industrial y la tecnología moderna como fuentes de dominación.',
    thinkers: ['John Zerzan'],
    connections: ['anarco-com', 'eco-prof'],
  },

  // ── Ecologismo ───────────────────────────────────────────────────────────
  {
    id: 'ecosoc-lib',
    name: 'Ecosocialismo libertario',
    family: 'ecologismo',
    coords: { x: -0.72, y: -0.55, z: 0.82 },
    description: 'Combina economía colectiva, mínimo Estado y máxima diversidad cultural. Énfasis en ecología y derechos de minorías.',
    thinkers: ['Murray Bookchin'],
    connections: ['verdes', 'decrecimiento'],
  },
  {
    id: 'verdes',
    name: 'Ecologismo político',
    family: 'ecologismo',
    coords: { x: -0.35, y: 0.05, z: 0.72 },
    description: 'La línea de los partidos verdes: sostenibilidad, democracia participativa, justicia social y pacifismo.',
    thinkers: ['Petra Kelly'],
    connections: ['decrecimiento', 'ecomodern', 'soc-plural'],
  },
  {
    id: 'decrecimiento',
    name: 'Decrecentismo',
    family: 'ecologismo',
    coords: { x: -0.6, y: -0.15, z: 0.5 },
    description: 'Reducir la producción y el consumo de forma planificada para vivir dentro de los límites del planeta.',
    thinkers: ['Serge Latouche', 'Giorgos Kallis'],
    connections: ['eco-prof'],
  },
  {
    id: 'ecomodern',
    name: 'Ecomodernismo',
    family: 'ecologismo',
    coords: { x: 0.35, y: 0.1, z: 0.5 },
    description: 'Proteger la naturaleza mediante la innovación tecnológica: energía nuclear, agricultura intensiva y urbanización.',
    thinkers: ['Manifiesto ecomodernista (2015)'],
    connections: ['tercera-via', 'tecnoprog'],
  },
  {
    id: 'eco-prof',
    name: 'Ecología profunda',
    family: 'ecologismo',
    coords: { x: -0.3, y: -0.1, z: -0.15 },
    description: 'Defiende el valor intrínseco de toda forma de vida y una reducción drástica del impacto humano.',
    thinkers: ['Arne Næss'],
    connections: [],
  },

  // ── Centro y reformismo ──────────────────────────────────────────────────
  {
    id: 'soc-plural',
    name: 'Socialdemocracia',
    family: 'reformismo',
    coords: { x: -0.38, y: 0.25, z: 0.52 },
    description: 'Economía mixta regulada, Estado de bienestar robusto y políticas activas de inclusión multicultural.',
    thinkers: ['Eduard Bernstein', 'Olof Palme'],
    connections: ['tercera-via', 'com-prog'],
  },
  {
    id: 'tercera-via',
    name: 'Tercera vía',
    family: 'reformismo',
    coords: { x: 0.15, y: 0.1, z: 0.45 },
    description: 'Síntesis entre socialdemocracia y mercado: Estado inversor, flexibilidad laboral y cohesión social.',
    thinkers: ['Anthony Giddens'],
    connections: ['lib-social', 'centro-rad'],
  },
  {
    id: 'dem-crist',
    name: 'Democracia cristiana',
    family: 'reformismo',
    coords: { x: 0.1, y: 0.35, z: 0.05 },
    description: 'Doctrina social de la Iglesia llevada a la política: economía social de mercado, familia y subsidiariedad.',
    thinkers: ['Jacques Maritain', 'Konrad Adenauer'],
    connections: ['ordolib', 'distributismo', 'com-prog'],
  },
  {
    id: 'distributismo',
    name: 'Distributismo',
    family: 'reformismo',
    coords: { x: 0.0, y: 0.2, z: -0.2 },
    description: 'La propiedad productiva debe repartirse entre muchos pequeños propietarios, ni en el Estado ni en grandes corporaciones.',
    thinkers: ['G. K. Chesterton', 'Hilaire Belloc'],
    connections: ['cons-trad', 'salamanca-lib'],
  },
  {
    id: 'com-prog',
    name: 'Comunitarismo progresista',
    family: 'reformismo',
    coords: { x: -0.28, y: 0.35, z: 0.42 },
    description: 'Comunidades fuertes con identidad compartida pero abiertas al diálogo intercultural. Subsidiariedad estatal.',
    thinkers: ['Amitai Etzioni', 'Michael Sandel'],
    connections: ['lib-social'],
  },
  {
    id: 'centro-rad',
    name: 'Centrismo radical',
    family: 'reformismo',
    coords: { x: 0.05, y: 0.0, z: 0.55 },
    description: 'Pragmatismo reformista que combina ideas de izquierda y derecha según lo que diga la evidencia.',
    thinkers: ['Mark Satin'],
    connections: ['tecnoprog', 'lib-social'],
  },
  {
    id: 'tecnoprog',
    name: 'Tecnoprogresismo',
    family: 'reformismo',
    coords: { x: -0.1, y: -0.2, z: 0.75 },
    description: 'La tecnología como herramienta de emancipación, con regulación democrática y acceso igualitario a sus beneficios.',
    thinkers: ['James Hughes'],
    connections: ['cosmopol'],
  },

  // ── Liberalismo ──────────────────────────────────────────────────────────
  {
    id: 'lib-social',
    name: 'Liberalismo social',
    family: 'liberalismo',
    coords: { x: 0.22, y: -0.15, z: 0.38 },
    description: 'Mercado libre con correcciones redistributivas y derechos civiles amplios. Centro-liberal pluralista.',
    thinkers: ['John Stuart Mill', 'John Rawls'],
    connections: ['lib-clasico', 'stakeholder', 'cosmopol', 'lib-izq'],
  },
  {
    id: 'lib-clasico',
    name: 'Liberalismo clásico',
    family: 'liberalismo',
    coords: { x: 0.65, y: -0.42, z: 0.18 },
    description: 'Libertades individuales y mercado libre con gobierno limitado. Derechos naturales.',
    thinkers: ['John Locke', 'Adam Smith'],
    connections: ['lib-mkt', 'neolib', 'georgismo', 'salamanca-lib'],
  },
  {
    id: 'neolib',
    name: 'Neoliberalismo',
    family: 'liberalismo',
    coords: { x: 0.75, y: 0.15, z: 0.3 },
    description: 'Liberalización de mercados, privatizaciones y disciplina fiscal, con un Estado que garantiza el orden de mercado.',
    thinkers: ['Milton Friedman'],
    connections: ['ordolib', 'cons-lib'],
  },
  {
    id: 'ordolib',
    name: 'Ordoliberalismo',
    family: 'liberalismo',
    coords: { x: 0.45, y: 0.25, z: 0.2 },
    description: 'Mercado competitivo protegido por un marco legal fuerte frente a los monopolios: la economía social de mercado alemana.',
    thinkers: ['Walter Eucken', 'Ludwig Erhard'],
    connections: ['stakeholder'],
  },
  {
    id: 'georgismo',
    name: 'Georgismo',
    family: 'liberalismo',
    coords: { x: 0.3, y: -0.3, z: 0.4 },
    description: 'Mercado libre con un impuesto único sobre el valor del suelo, que se considera patrimonio común.',
    thinkers: ['Henry George'],
    connections: ['lib-izq'],
  },
  {
    id: 'stakeholder',
    name: 'Capitalismo de stakeholders',
    family: 'liberalismo',
    coords: { x: 0.55, y: 0.12, z: 0.3 },
    description: 'Empresa libre pero responsable ante empleados, comunidad y medioambiente. ESG y responsabilidad corporativa.',
    thinkers: ['R. Edward Freeman'],
    connections: [],
  },
  {
    id: 'cosmopol',
    name: 'Cosmopolitismo liberal',
    family: 'liberalismo',
    coords: { x: 0.35, y: 0.0, z: 0.88 },
    description: 'Instituciones globales, libre circulación de personas y derechos humanos universales por encima de las fronteras.',
    thinkers: ['Immanuel Kant', 'Martha Nussbaum'],
    connections: [],
  },
  {
    id: 'lib-izq',
    name: 'Libertarismo de izquierda',
    family: 'liberalismo',
    coords: { x: -0.3, y: -0.7, z: 0.65 },
    description: 'Plena autopropiedad individual combinada con un reparto igualitario de los recursos naturales.',
    thinkers: ['Hillel Steiner', 'Peter Vallentyne'],
    connections: [],
  },

  // ── Libertarismo de derecha ──────────────────────────────────────────────
  {
    id: 'lib-mkt',
    name: 'Minarquismo',
    family: 'libertarismo',
    coords: { x: 0.82, y: -0.72, z: 0.08 },
    description: 'El mínimo gobierno posible (justicia, policía y defensa) y un libre mercado radical. Individualismo extremo.',
    thinkers: ['Robert Nozick', 'Ayn Rand'],
    connections: ['ancap', 'salamanca-lib'],
  },
  {
    id: 'ancap',
    name: 'Anarcocapitalismo',
    family: 'libertarismo',
    coords: { x: 0.95, y: -0.95, z: 0.2 },
    description: 'Abolición del Estado: seguridad, justicia y todos los servicios los provee el mercado.',
    thinkers: ['Murray Rothbard', 'David Friedman'],
    connections: ['agorismo', 'paleolib'],
  },
  {
    id: 'agorismo',
    name: 'Agorismo',
    family: 'libertarismo',
    coords: { x: 0.85, y: -0.9, z: 0.35 },
    description: 'Llegar a una sociedad sin Estado mediante la contraeconomía y los mercados no regulados.',
    thinkers: ['Samuel Edward Konkin III'],
    connections: [],
  },
  {
    id: 'paleolib',
    name: 'Paleolibertarismo',
    family: 'libertarismo',
    coords: { x: 0.85, y: -0.55, z: -0.6 },
    description: 'Libre mercado radical unido a valores culturales tradicionales y a la descentralización.',
    thinkers: ['Hans-Hermann Hoppe', 'Lew Rockwell'],
    connections: ['paleocon'],
  },

  // ── Conservadurismo ──────────────────────────────────────────────────────
  {
    id: 'cons-lib',
    name: 'Conservadurismo liberal',
    family: 'conservadurismo',
    coords: { x: 0.55, y: 0.3, z: -0.1 },
    description: 'Mercado libre y respeto a las instituciones tradicionales, con reformas graduales en lugar de rupturas.',
    thinkers: ['Michael Oakeshott'],
    connections: ['cons-trad', 'neocon'],
  },
  {
    id: 'cons-trad',
    name: 'Conservadurismo tradicionalista',
    family: 'conservadurismo',
    coords: { x: 0.3, y: 0.5, z: -0.45 },
    description: 'Defensa de la tradición, la religión y las jerarquías heredadas frente al cambio revolucionario.',
    thinkers: ['Edmund Burke', 'Russell Kirk'],
    connections: ['monarq', 'paleocon'],
  },
  {
    id: 'neocon',
    name: 'Neoconservadurismo',
    family: 'conservadurismo',
    coords: { x: 0.68, y: 0.72, z: -0.52 },
    description: 'Mercado libre con Estado fuerte, valores culturales tradicionales y política exterior intervencionista.',
    thinkers: ['Irving Kristol'],
    connections: [],
  },
  {
    id: 'paleocon',
    name: 'Paleoconservadurismo',
    family: 'conservadurismo',
    coords: { x: 0.35, y: 0.45, z: -0.72 },
    description: 'Nacionalismo cultural, no intervencionismo exterior y rechazo a la inmigración masiva y al libre comercio global.',
    thinkers: ['Pat Buchanan', 'Samuel Francis'],
    connections: ['pop-der'],
  },
  {
    id: 'pop-der',
    name: 'Nacionalpopulismo',
    family: 'conservadurismo',
    coords: { x: 0.25, y: 0.55, z: -0.78 },
    description: 'El «pueblo» nacional frente a las élites globalistas: soberanía, control migratorio y valores tradicionales.',
    thinkers: [],
    connections: [],
  },
  {
    id: 'monarq',
    name: 'Monarquismo tradicionalista',
    family: 'conservadurismo',
    coords: { x: 0.2, y: 0.75, z: -0.6 },
    description: 'La monarquía como fuente de legitimidad y continuidad histórica, a menudo unida a la fe religiosa.',
    thinkers: ['Joseph de Maistre'],
    connections: ['teocracia'],
  },

  // ── Autoritarismo y nacionalismo ─────────────────────────────────────────
  {
    id: 'teocracia',
    name: 'Teocracia autoritaria',
    family: 'autoritarismo',
    coords: { x: 0.18, y: 0.92, z: -0.82 },
    description: 'Gobierno fundamentado en la ley religiosa. Estado máximo que impone una doctrina única y la asimilación cultural.',
    thinkers: [],
    connections: [],
  },
  {
    id: 'nation-soc',
    name: 'Colectivismo autoritario excluyente',
    family: 'autoritarismo',
    coords: { x: -0.32, y: 0.88, z: -0.9 },
    description: 'Economía controlada por el Estado, poder político centralizado y homogeneización cultural forzada.',
    thinkers: [],
    connections: ['fascismo'],
  },
  {
    id: 'fascismo',
    name: 'Fascismo',
    family: 'autoritarismo',
    coords: { x: 0.1, y: 0.95, z: -0.88 },
    description: 'Estado totalitario, nacionalismo exaltado, corporativismo y culto al líder.',
    thinkers: ['Giovanni Gentile'],
    connections: ['nazbol'],
  },
  {
    id: 'nazbol',
    name: 'Nacionalbolchevismo',
    family: 'autoritarismo',
    coords: { x: -0.6, y: 0.9, z: -0.8 },
    description: 'Mezcla de economía colectivista y nacionalismo autoritario.',
    thinkers: ['Ernst Niekisch'],
    connections: [],
  },
  {
    id: 'tecnocracia',
    name: 'Tecnocracia',
    family: 'autoritarismo',
    coords: { x: 0.1, y: 0.65, z: 0.2 },
    description: 'Gobierno de expertos y técnicos en lugar de representantes elegidos.',
    thinkers: ['Henri de Saint-Simon'],
    connections: ['cap-estado'],
  },
  {
    id: 'cap-estado',
    name: 'Capitalismo de Estado autoritario',
    family: 'autoritarismo',
    coords: { x: 0.3, y: 0.8, z: -0.3 },
    description: 'Economía de mercado dirigida por un Estado de partido único que limita las libertades políticas.',
    thinkers: [],
    connections: [],
  },

  // ── Propuesta del autor ──────────────────────────────────────────────────
  // Eje X  =  0.3   →  Centro-Derecha
  // Eje Y  = -0.95  →  Extremo Libertario/Anárquico
  // Eje Z  =  0.35  →  Pluralismo moderado (fe por caridad y libre albedrío, no por obligación)
  {
    id: 'salamanca-lib',
    name: 'Neo-Salamanquismo Tecno-Estóico (Anarquía Aceleracionista)',
    family: 'autor',
    author: true,
    coords: { x: 0.3, y: -0.95, z: 0.35 },
    description:
      'Síntesis filosófica que une el pensamiento anti-industrial y la soberanía popular radical con el aceleracionismo tecnológico y la teología de la Escuela de Salamanca. Defiende un ideal moral católico tradicional pero bajo un estricto principio de no coacción: la fe debe llegar por caridad y libre albedrío, nunca por obligación estatal. Rechaza por completo el sistema industrial y los estados totalitarios (como el nazismo), adoptando una postura estóica ante el avance de la Inteligencia Artificial, viéndola como un catalizador inevitable que disolverá las estructuras de control moderno para devolver el orden a comunidades orgánicas y descentralizadas.',
    thinkers: ['Escuela de Salamanca'],
    connections: [],
  },
];

export const IDEOLOGIES = RAW_IDEOLOGIES.map((ideology) => ({
  kind: 'ideology',
  author: false,
  ...ideology,
  color: FAMILIES[ideology.family].color,
  shape: FAMILIES[ideology.family].shape,
}));

export const IDEOLOGY_BY_ID = Object.fromEntries(IDEOLOGIES.map((i) => [i.id, i]));

/** Minúsculas y sin tildes, para que "ecologia" encuentre "ecología" */
const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Indica si una corriente coincide con el texto de búsqueda (por nombre).
 * Una búsqueda vacía coincide con todo.
 */
export function matchesSearch(ideology, search) {
  return normalize(ideology.name).includes(normalize(search.trim()));
}
